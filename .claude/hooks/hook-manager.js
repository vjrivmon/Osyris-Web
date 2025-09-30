/**
 * 🪝 Osyris Hook Manager
 * Central orchestrator for all hook operations
 */

const fs = require('fs').promises
const path = require('path')
const { execSync, spawn } = require('child_process')

class HookManager {
  constructor() {
    this.config = null
    this.isInitialized = false
    this.executionLog = []
  }

  /**
   * Initialize hook manager with configuration
   */
  async initialize() {
    try {
      const configPath = path.join(__dirname, 'config.json')
      const configData = await fs.readFile(configPath, 'utf8')
      this.config = JSON.parse(configData)
      this.isInitialized = true

      await this.log('info', 'Hook Manager initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Hook Manager:', error)
      return false
    }
  }

  /**
   * Execute hooks for a specific trigger
   */
  async executeHooks(trigger, context = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.config.enabled) {
      await this.log('info', `Hook system disabled, skipping ${trigger}`)
      return { success: true, skipped: true }
    }

    await this.log('info', `🪝 Executing hooks for trigger: ${trigger}`)

    const hookConfig = this.config.hooks[trigger]
    if (!hookConfig || !hookConfig.enabled) {
      await this.log('info', `Hook ${trigger} is disabled or not configured`)
      return { success: true, skipped: true }
    }

    try {
      const results = []

      // Execute hook scripts
      if (hookConfig.scripts) {
        for (const script of hookConfig.scripts) {
          const result = await this.executeScript(script, context)
          results.push(result)

          if (!result.success && !result.optional) {
            throw new Error(`Critical hook script failed: ${script}`)
          }
        }
      }

      // Execute sub-hooks (pre/post patterns)
      for (const phase of ['pre', 'post']) {
        const phaseKey = `${phase}-${trigger}`
        if (hookConfig[phaseKey]) {
          for (const script of hookConfig[phaseKey]) {
            const result = await this.executeScript(script, { ...context, phase })
            results.push(result)
          }
        }
      }

      // Trigger relevant agents
      await this.triggerAgents(trigger, context)

      await this.log('info', `✅ Hook ${trigger} completed successfully`)
      return { success: true, results }

    } catch (error) {
      await this.log('error', `❌ Hook ${trigger} failed: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Execute a specific hook script
   */
  async executeScript(scriptName, context) {
    const startTime = Date.now()

    try {
      await this.log('info', `  🔄 Executing script: ${scriptName}`)

      // Check if script exists
      const scriptPath = path.join(__dirname, 'scripts', `${scriptName}.js`)

      try {
        await fs.access(scriptPath)
      } catch {
        // Script doesn't exist, try shell script
        const shellScriptPath = path.join(__dirname, 'scripts', `${scriptName}.sh`)
        try {
          await fs.access(shellScriptPath)
          return await this.executeShellScript(shellScriptPath, context)
        } catch {
          await this.log('warning', `    ⚠️ Script not found: ${scriptName}`)
          return { success: true, skipped: true, script: scriptName }
        }
      }

      // Execute Node.js script
      const script = require(scriptPath)
      const result = await script.execute(context, this.config)

      const duration = Date.now() - startTime
      await this.log('info', `    ✅ Script ${scriptName} completed in ${duration}ms`)

      return {
        success: true,
        script: scriptName,
        duration,
        result
      }

    } catch (error) {
      const duration = Date.now() - startTime
      await this.log('error', `    ❌ Script ${scriptName} failed after ${duration}ms: ${error.message}`)

      return {
        success: false,
        script: scriptName,
        duration,
        error: error.message
      }
    }
  }

  /**
   * Execute shell script
   */
  async executeShellScript(scriptPath, context) {
    return new Promise((resolve) => {
      const startTime = Date.now()

      const env = {
        ...process.env,
        HOOK_CONTEXT: JSON.stringify(context),
        HOOK_CONFIG: JSON.stringify(this.config)
      }

      const child = spawn('bash', [scriptPath], {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', async (code) => {
        const duration = Date.now() - startTime
        const scriptName = path.basename(scriptPath, '.sh')

        if (code === 0) {
          await this.log('info', `    ✅ Shell script ${scriptName} completed in ${duration}ms`)
          resolve({
            success: true,
            script: scriptName,
            duration,
            stdout,
            stderr
          })
        } else {
          await this.log('error', `    ❌ Shell script ${scriptName} failed with code ${code}`)
          resolve({
            success: false,
            script: scriptName,
            duration,
            stdout,
            stderr,
            exitCode: code
          })
        }
      })
    })
  }

  /**
   * Trigger relevant agents based on hook
   */
  async triggerAgents(trigger, context) {
    const relevantAgents = Object.entries(this.config.agents)
      .filter(([name, config]) =>
        config.enabled && config.triggers.includes(trigger)
      )

    for (const [agentName, agentConfig] of relevantAgents) {
      await this.log('info', `  🤖 Triggering agent: ${agentName}`)

      try {
        // Here we would integrate with the Task tool to launch the appropriate agent
        // For now, we'll log the action
        await this.log('info', `    Agent ${agentName} would be triggered with config:`, agentConfig.config)

        // In actual implementation:
        // await this.taskTool.launch(agentName, context, agentConfig.config)

      } catch (error) {
        await this.log('error', `    ❌ Failed to trigger agent ${agentName}: ${error.message}`)
      }
    }
  }

  /**
   * Environment detection and switching
   */
  async detectEnvironment() {
    try {
      // Check if we're using SQLite (development) or Supabase (production)
      const dbConfigPath = path.join(__dirname, '..', '..', 'api-osyris', 'src', 'config', 'db.config.js')
      const dbConfig = await fs.readFile(dbConfigPath, 'utf8')

      if (dbConfig.includes('sqlite3')) {
        return 'development'
      } else if (dbConfig.includes('supabase')) {
        return 'production'
      }

      return 'unknown'
    } catch (error) {
      await this.log('warning', `Could not detect environment: ${error.message}`)
      return 'unknown'
    }
  }

  /**
   * Switch environment configuration
   */
  async switchEnvironment(targetEnvironment) {
    const currentEnvironment = await this.detectEnvironment()

    if (currentEnvironment === targetEnvironment) {
      await this.log('info', `Already in ${targetEnvironment} environment`)
      return { success: true, noChange: true }
    }

    await this.log('info', `🔄 Switching from ${currentEnvironment} to ${targetEnvironment}`)

    try {
      // Execute environment switch hooks
      const result = await this.executeHooks('environment-switch', {
        from: currentEnvironment,
        to: targetEnvironment
      })

      if (result.success) {
        await this.log('info', `✅ Successfully switched to ${targetEnvironment} environment`)
      }

      return result
    } catch (error) {
      await this.log('error', `❌ Failed to switch environment: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  /**
   * Logging functionality
   */
  async log(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      data
    }

    // Console output with colors
    const colors = {
      info: '\x1b[36m',    // Cyan
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'
    }

    const color = colors[level] || colors.reset
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`)
    if (data) {
      console.log(data)
    }

    // Store in execution log
    this.executionLog.push(logEntry)

    // Write to file if enabled
    if (this.config?.notifications?.enabled && this.config?.notifications?.channels?.includes('file')) {
      try {
        const logDir = path.dirname(this.config.notifications['file-path'])
        await fs.mkdir(logDir, { recursive: true })
        await fs.appendFile(
          this.config.notifications['file-path'],
          JSON.stringify(logEntry) + '\n'
        )
      } catch (error) {
        console.error('Failed to write to log file:', error)
      }
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory() {
    return this.executionLog
  }

  /**
   * Health check
   */
  async healthCheck() {
    const health = {
      initialized: this.isInitialized,
      configLoaded: !!this.config,
      environment: await this.detectEnvironment(),
      enabledHooks: this.config ? Object.keys(this.config.hooks).filter(
        hook => this.config.hooks[hook].enabled
      ) : [],
      enabledAgents: this.config ? Object.keys(this.config.agents).filter(
        agent => this.config.agents[agent].enabled
      ) : []
    }

    return health
  }
}

module.exports = new HookManager()