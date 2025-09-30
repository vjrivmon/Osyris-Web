/**
 * 🚀 Pre-Push Hook: Validate Production Readiness
 * Ensures the system is ready for production deployment
 */

const fs = require('fs').promises
const path = require('path')

async function execute(context, config) {
  const results = {
    checks: [],
    passed: true,
    warnings: [],
    errors: []
  }

  try {
    // 1. Check Supabase configuration
    await checkSupabaseConfig(results)

    // 2. Validate environment variables
    await validateEnvironmentVariables(results)

    // 3. Check database schema compatibility
    await checkDatabaseSchema(results)

    // 4. Validate file upload configuration
    await validateUploadConfig(results)

    // 5. Check for sensitive data
    await checkForSensitiveData(results)

    // 6. Validate build integrity
    await validateBuildIntegrity(results)

    results.passed = results.errors.length === 0

    return {
      success: results.passed,
      message: results.passed ? 'Production readiness validated' : 'Production readiness check failed',
      details: results
    }

  } catch (error) {
    return {
      success: false,
      message: 'Production readiness validation failed',
      error: error.message
    }
  }
}

async function checkSupabaseConfig(results) {
  try {
    const configPath = path.join(__dirname, '../../../api-osyris/src/config/supabase.config.js')
    const configContent = await fs.readFile(configPath, 'utf8')

    // Check for required configuration
    const requiredConfigs = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'createClient'
    ]

    const missingConfigs = requiredConfigs.filter(config =>
      !configContent.includes(config)
    )

    if (missingConfigs.length > 0) {
      results.errors.push(`Missing Supabase configuration: ${missingConfigs.join(', ')}`)
    } else {
      results.checks.push('✅ Supabase configuration complete')
    }

    // Check if using environment variables (not hardcoded)
    if (configContent.includes('process.env.SUPABASE_URL')) {
      results.checks.push('✅ Supabase URL using environment variable')
    } else {
      results.warnings.push('⚠️ Supabase URL should use environment variable')
    }

  } catch (error) {
    results.errors.push(`Failed to check Supabase config: ${error.message}`)
  }
}

async function validateEnvironmentVariables(results) {
  const requiredEnvVars = [
    'NODE_ENV',
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ]

  const optionalEnvVars = [
    'SUPABASE_SERVICE_KEY'
  ]

  // Check if .env.example exists as template
  try {
    const envExamplePath = path.join(__dirname, '../../../api-osyris/.env.example')
    await fs.access(envExamplePath)
    results.checks.push('✅ .env.example template exists')

    const envExample = await fs.readFile(envExamplePath, 'utf8')

    for (const envVar of requiredEnvVars) {
      if (!envExample.includes(envVar)) {
        results.warnings.push(`⚠️ ${envVar} not documented in .env.example`)
      }
    }

  } catch (error) {
    results.warnings.push('⚠️ .env.example template missing')
  }

  // Check current environment variables
  const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar])
  const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar])

  if (missingRequired.length > 0) {
    results.errors.push(`Missing required environment variables: ${missingRequired.join(', ')}`)
  } else {
    results.checks.push('✅ All required environment variables present')
  }

  if (missingOptional.length > 0) {
    results.warnings.push(`Missing optional environment variables: ${missingOptional.join(', ')}`)
  }
}

async function checkDatabaseSchema(results) {
  try {
    // Check if schema migration files exist
    const migrationDir = path.join(__dirname, '../../../api-osyris/migrations')

    try {
      const migrations = await fs.readdir(migrationDir)
      if (migrations.length > 0) {
        results.checks.push(`✅ ${migrations.length} migration files found`)
      } else {
        results.warnings.push('⚠️ No migration files found')
      }
    } catch (error) {
      results.warnings.push('⚠️ Migration directory not found')
    }

    // Check for schema compatibility indicators
    const supabaseConfigPath = path.join(__dirname, '../../../api-osyris/src/config/supabase.config.js')
    const supabaseConfig = await fs.readFile(supabaseConfigPath, 'utf8')

    if (supabaseConfig.includes('usuarios') && supabaseConfig.includes('secciones')) {
      results.checks.push('✅ Core tables configured in Supabase')
    } else {
      results.warnings.push('⚠️ Core tables may not be properly configured')
    }

  } catch (error) {
    results.warnings.push(`Could not validate database schema: ${error.message}`)
  }
}

async function validateUploadConfig(results) {
  try {
    // Check upload controllers exist
    const localUploadPath = path.join(__dirname, '../../../api-osyris/src/controllers/upload.local.controller.js')
    const supabaseUploadPath = path.join(__dirname, '../../../api-osyris/src/controllers/upload.supabase.controller.js')

    try {
      await fs.access(localUploadPath)
      await fs.access(supabaseUploadPath)
      results.checks.push('✅ Dual upload controllers available')
    } catch (error) {
      results.errors.push('❌ Upload controllers missing')
    }

    // Check Supabase storage configuration
    const supabaseUploadContent = await fs.readFile(supabaseUploadPath, 'utf8')
    if (supabaseUploadContent.includes('osyris-files')) {
      results.checks.push('✅ Supabase storage bucket configured')
    } else {
      results.warnings.push('⚠️ Supabase storage bucket may not be configured')
    }

  } catch (error) {
    results.warnings.push(`Could not validate upload config: ${error.message}`)
  }
}

async function checkForSensitiveData(results) {
  const sensitivePatterns = [
    /password\s*[:=]\s*['"'][^'"]{3,}['"]/gi,
    /secret\s*[:=]\s*['"'][^'"]{10,}['"]/gi,
    /key\s*[:=]\s*['"'][^'"]{20,}['"]/gi,
    /admin@.*\.com/gi
  ]

  const filesToCheck = [
    '../../../api-osyris/src/config/db.config.js',
    '../../../api-osyris/src/config/supabase.config.js',
    '../../../package.json',
    '../../../api-osyris/package.json'
  ]

  let foundSensitive = false

  for (const filePath of filesToCheck) {
    try {
      const fullPath = path.join(__dirname, filePath)
      const content = await fs.readFile(fullPath, 'utf8')

      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          foundSensitive = true
          results.warnings.push(`⚠️ Potential sensitive data in ${path.basename(filePath)}`)
          break
        }
      }
    } catch (error) {
      // File doesn't exist or can't be read, skip
    }
  }

  if (!foundSensitive) {
    results.checks.push('✅ No obvious sensitive data in configuration files')
  }
}

async function validateBuildIntegrity(results) {
  try {
    // Check if package.json build scripts exist
    const packageJsonPath = path.join(__dirname, '../../../package.json')
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))

    if (packageJson.scripts && packageJson.scripts.build) {
      results.checks.push('✅ Build script configured')
    } else {
      results.warnings.push('⚠️ Build script missing in package.json')
    }

    // Check for Next.js configuration
    const nextConfigPath = path.join(__dirname, '../../../next.config.mjs')
    try {
      await fs.access(nextConfigPath)
      results.checks.push('✅ Next.js configuration exists')
    } catch (error) {
      results.warnings.push('⚠️ Next.js configuration missing')
    }

  } catch (error) {
    results.warnings.push(`Could not validate build integrity: ${error.message}`)
  }
}

module.exports = { execute }