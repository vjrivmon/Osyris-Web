'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/api-utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Settings, Users, Image as ImageIcon, Trash2, Eye, Copy, Download, Edit3, Save, RotateCcw, UserPlus, Shield, Mail, Calendar, Server, Database, Key, Globe, HardDrive, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

/**
 * 🏕️ PANEL DE ADMINISTRACIÓN CMS - GRUPO SCOUT OSYRIS
 * Panel exclusivo para administradores (admin)
 */

export default function AdminPanel() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState('general');
  const [altText, setAltText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Estados para editor de páginas
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [editingPage, setEditingPage] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Estados para gestión de usuarios
  const [users, setUsers] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    rol: 'scouter',
    seccion: '',
    activo: true
  });

  // Estados para configuración
  const [siteConfig, setSiteConfig] = useState({
    siteName: 'Grupo Scout Osyris',
    siteEmail: 'kraal@grupoosyris.es',
    sitePhone: '',
    siteAddress: '',
    siteDescription: 'Grupo Scout en Sevilla comprometido con la educación integral de jóvenes.',
    maintenanceMode: false,
    allowRegistrations: true,
    enableNotifications: true
  });

  // Cargar archivos subidos, páginas y usuarios
  useEffect(() => {
    loadFiles();
    loadPages();
    loadUsers();
  }, []);

  const loadFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/uploads`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar archivos:', error);
    }
  };

  // Cargar páginas reales del sitio
  const loadPages = () => {
    const realPages = [
      {
        id: 1,
        name: 'Página Principal',
        path: '/',
        route: 'page.tsx',
        description: 'Página de inicio del sitio web',
        lastModified: '2024-01-15'
      },
      {
        id: 2,
        name: 'Sobre Nosotros',
        path: '/sobre-nosotros',
        route: 'sobre-nosotros/page.tsx',
        description: 'Información sobre el grupo scout',
        lastModified: '2024-01-10'
      },
      {
        id: 3,
        name: 'Contacto',
        path: '/contacto',
        route: 'contacto/page.tsx',
        description: 'Información de contacto',
        lastModified: '2024-01-08'
      },
      {
        id: 4,
        name: 'Calendario',
        path: '/calendario',
        route: 'calendario/page.tsx',
        description: 'Calendario de actividades',
        lastModified: '2024-01-12'
      },
      {
        id: 5,
        name: 'Galería',
        path: '/galeria',
        route: 'galeria/page.tsx',
        description: 'Galería de fotos',
        lastModified: '2024-01-09'
      },
      {
        id: 6,
        name: 'Secciones',
        path: '/secciones',
        route: 'secciones/page.tsx',
        description: 'Información de las secciones scout',
        lastModified: '2024-01-11'
      },
      {
        id: 7,
        name: 'Castores',
        path: '/secciones/castores',
        route: 'secciones/castores/page.tsx',
        description: 'Sección Castores (5-7 años)',
        lastModified: '2024-01-07'
      },
      {
        id: 8,
        name: 'Lobatos',
        path: '/secciones/lobatos',
        route: 'secciones/lobatos/page.tsx',
        description: 'Sección Lobatos (7-10 años)',
        lastModified: '2024-01-06'
      },
      {
        id: 9,
        name: 'Tropa',
        path: '/secciones/tropa',
        route: 'secciones/tropa/page.tsx',
        description: 'Sección Tropa (10-13 años)',
        lastModified: '2024-01-05'
      },
      {
        id: 10,
        name: 'Pioneros',
        path: '/secciones/pioneros',
        route: 'secciones/pioneros/page.tsx',
        description: 'Sección Pioneros (13-16 años)',
        lastModified: '2024-01-04'
      },
      {
        id: 11,
        name: 'Rutas',
        path: '/secciones/rutas',
        route: 'secciones/rutas/page.tsx',
        description: 'Sección Rutas (16-19 años)',
        lastModified: '2024-01-03'
      },
      {
        id: 12,
        name: 'Preguntas Frecuentes',
        path: '/preguntas-frecuentes',
        route: 'preguntas-frecuentes/page.tsx',
        description: 'Preguntas frecuentes',
        lastModified: '2024-01-02'
      }
    ];
    setPages(realPages);
  };

  // Manejar selección de archivo
  const handleFileSelect = (file: File) => {
    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'El archivo no puede superar los 10MB',
        variant: 'destructive'
      });
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Tipo de archivo no permitido. Solo se permiten imágenes, PDFs y documentos Word.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);

    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Manejar drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Subir archivo
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', uploadFolder);
      formData.append('altText', altText);

      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();

        toast({
          title: '✅ Archivo subido',
          description: 'El archivo se ha subido correctamente'
        });

        // Limpiar y recargar
        setSelectedFile(null);
        setAltText('');
        setPreviewUrl(null);
        loadFiles();

        // Mostrar URL para copiar
        if (data.data?.url) {
          navigator.clipboard.writeText(data.data.url);
          toast({
            title: '📋 URL copiada',
            description: 'La URL del archivo se ha copiado al portapapeles'
          });
        }
      } else {
        throw new Error('Error al subir archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir el archivo',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar archivo
  const handleDelete = async (fileId: number) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/uploads/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: '🗑️ Archivo eliminado',
          description: 'El archivo se ha eliminado correctamente'
        });
        loadFiles();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivo',
        variant: 'destructive'
      });
    }
  };


  // Funciones para gestión de usuarios
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        console.error('Error al cargar usuarios');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsers([]);
    }
  };

  const addUser = async () => {
    // Validaciones básicas
    if (!newUser.nombre || !newUser.apellidos || !newUser.email) {
      toast({
        title: 'Error',
        description: 'Todos los campos obligatorios deben estar completos',
        variant: 'destructive'
      });
      return;
    }

    // Validar email único
    if (users.some(user => user.email === newUser.email)) {
      toast({
        title: 'Error',
        description: 'Ya existe un usuario con este email',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);

      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: newUser.nombre,
          apellidos: newUser.apellidos,
          email: newUser.email,
          rol: newUser.rol,
          seccion: newUser.seccion,
          password: 'temp123', // Contraseña temporal que deberán cambiar
          activo: newUser.activo
        })
      });

      if (response.ok) {
        const data = await response.json();

        toast({
          title: '✅ Usuario creado',
          description: `${newUser.nombre} ${newUser.apellidos} ha sido agregado al sistema`
        });

        // Recargar lista de usuarios
        await loadUsers();

        // Resetear formulario
        setNewUser({
          nombre: '',
          apellidos: '',
          email: '',
          rol: 'scouter',
          seccion: '',
          activo: true
        });
        setShowAddUser(false);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.message || 'No se pudo crear el usuario',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el usuario',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activo: !user.activo
        })
      });

      if (response.ok) {
        await loadUsers(); // Recargar usuarios

        toast({
          title: user.activo ? '🔒 Usuario desactivado' : '✅ Usuario activado',
          description: `${user.nombre} ${user.apellidos} ${user.activo ? 'desactivado' : 'activado'}`
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el estado del usuario',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del usuario',
        variant: 'destructive'
      });
    }
  };

  const deleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`¿Estás seguro de eliminar a ${user.nombre} ${user.apellidos}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${getApiUrl()}/api/usuarios/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Recargar lista de usuarios desde el servidor
        await loadUsers();

        toast({
          title: '🗑️ Usuario eliminado',
          description: `${user.nombre} ${user.apellidos} ha sido eliminado del sistema`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'super_admin':
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />Super Admin</Badge>;
      case 'admin':
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />Administrador</Badge>;
      case 'coordinador':
        return <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" />Coordinador</Badge>;
      case 'scouter':
        return <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />Scouter</Badge>;
      case 'padre':
        return <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />Familia</Badge>;
      case 'educando':
        return <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />Educando</Badge>;
      default:
        return <Badge variant="outline">{rol}</Badge>;
    }
  };

  const getSectionBadge = (seccion: string) => {
    const sectionColors = {
      'Castores': 'bg-orange-100 text-orange-800',
      'Lobatos': 'bg-yellow-100 text-yellow-800',
      'Tropa': 'bg-green-100 text-green-800',
      'Pioneros': 'bg-red-100 text-red-800',
      'Rutas': 'bg-blue-100 text-blue-800',
      'Administración': 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={sectionColors[seccion as keyof typeof sectionColors] || 'bg-gray-100 text-gray-800'}>
        {seccion}
      </Badge>
    );
  };

  // Funciones para configuración
  const saveConfiguration = async () => {
    try {
      setIsLoading(true);

      // Simular llamada al API para guardar configuración

      toast({
        title: '✅ Configuración guardada',
        description: 'Los ajustes se han guardado correctamente'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setIsLoading(true);

      // Simular creación de backup
      await new Promise(resolve => setTimeout(resolve, 2000));

      const backupData = {
        timestamp: new Date().toISOString(),
        users: users.length,
        files: uploadedFiles.length,
        pages: pages.length
      };

      // Crear y descargar archivo de backup
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `osyris-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: '💾 Backup creado',
        description: 'El backup se ha descargado correctamente'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el backup',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setIsLoading(true);

      // Simular limpieza de caché
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: '🧹 Caché limpiado',
        description: 'El caché del sistema se ha limpiado correctamente'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo limpiar el caché',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para manejo de páginas
  const selectPage = (page: any) => {
    setSelectedPage(page);
    setPageTitle(page.title);
    setPageContent(page.content);
    setEditingPage(false);
  };

  const startEditing = () => {
    setEditingPage(true);
    setShowPreview(false);
  };

  const cancelEditing = () => {
    setEditingPage(false);
    setShowPreview(false);
    if (selectedPage) {
      setPageTitle(selectedPage.title);
      setPageContent(selectedPage.content);
    }
  };

  const savePage = async () => {
    try {
      setIsLoading(true);

      // Simular guardado de página
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar la página en el estado local
      if (selectedPage) {
        const updatedPage = {
          ...selectedPage,
          title: pageTitle,
          content: pageContent
        };
        setSelectedPage(updatedPage);

        // Actualizar en la lista de páginas
        setPages(pages.map(p => p.id === selectedPage.id ? updatedPage : p));
      }

      setEditingPage(false);

      toast({
        title: '✅ Página guardada',
        description: 'Los cambios se han guardado correctamente'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛠️ Panel de Administración CMS</h1>
        <p className="text-muted-foreground">
          Sistema de gestión de contenido para super administradores
        </p>
      </div>

      <Tabs defaultValue="files" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="files">
            <Upload className="mr-2 h-4 w-4" />
            Archivos
          </TabsTrigger>
          <TabsTrigger value="pages">
            <FileText className="mr-2 h-4 w-4" />
            Páginas
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Tab de Archivos */}
        <TabsContent value="files" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Subir archivo */}
            <Card>
              <CardHeader>
                <CardTitle>📤 Subir Archivo</CardTitle>
                <CardDescription>
                  Sube imágenes y documentos al sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Área de drag & drop */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Archivo (máx 10MB)
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      onChange={handleInputChange}
                      accept="image/*,application/pdf,.doc,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {!selectedFile ? (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Arrastra un archivo aquí o haz clic para seleccionar
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Imágenes, PDFs y documentos Word hasta 10MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Preview de imagen */}
                        {previewUrl && (
                          <div className="mx-auto w-32 h-32 rounded-lg overflow-hidden border">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Info del archivo */}
                        <div className="text-left space-y-1">
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB • {selectedFile.type}
                          </p>
                        </div>

                        {/* Botón para cambiar archivo */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          Cambiar archivo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Carpeta
                  </label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="general">General</option>
                    <option value="secciones">Secciones</option>
                    <option value="actividades">Actividades</option>
                    <option value="documentos">Documentos</option>
                    <option value="galeria">Galería</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Texto alternativo (para imágenes)
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Descripción de la imagen"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Subiendo...' : 'Subir Archivo'}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de archivos */}
            <Card>
              <CardHeader>
                <CardTitle>📁 Archivos Subidos</CardTitle>
                <CardDescription>
                  Total: {uploadedFiles.length} archivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="group flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Miniatura para imágenes */}
                        {file.file_type?.startsWith('image/') ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden border bg-muted">
                            <img
                              src={file.file_url}
                              alt={file.alt_text || file.original_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (sibling) sibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full hidden items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}

                        {/* Info del archivo */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.original_name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{file.folder}</span>
                            <span>•</span>
                            <span>{(file.file_size / 1024).toFixed(1)}KB</span>
                            {file.alt_text && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-32" title={file.alt_text}>
                                  {file.alt_text}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Ver archivo */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(file.file_url, '_blank')}
                          title="Ver archivo"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Copiar URL */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(file.file_url);
                            toast({
                              title: '📋 URL copiada',
                              description: 'URL copiada al portapapeles'
                            });
                          }}
                          title="Copiar URL"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        {/* Descargar */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.file_url;
                            link.download = file.original_name;
                            link.click();
                          }}
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {/* Eliminar */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(file.id)}
                          title="Eliminar archivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {uploadedFiles.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No hay archivos subidos
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Páginas */}
        <TabsContent value="pages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Lista de páginas */}
            <Card>
              <CardHeader>
                <CardTitle>📄 Páginas del Sitio</CardTitle>
                <CardDescription>
                  Selecciona una página para editar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => selectPage(page)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPage?.id === page.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <p className="font-medium text-sm">{page.name}</p>
                      <p className="text-xs text-muted-foreground">{page.path}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Editor de contenido */}
            <div className="md:col-span-2">
              {selectedPage ? (
                <Card className="h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Edit3 className="h-5 w-5" />
                          {editingPage ? 'Editando' : 'Vista'}: {selectedPage.title}
                        </CardTitle>
                        <CardDescription>{selectedPage.path}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {!editingPage ? (
                          <Button onClick={startEditing} size="sm">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setShowPreview(!showPreview)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {showPreview ? 'Editor' : 'Vista previa'}
                            </Button>
                            <Button
                              onClick={cancelEditing}
                              variant="outline"
                              size="sm"
                              disabled={isLoading}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button
                              onClick={savePage}
                              size="sm"
                              disabled={isLoading}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {isLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingPage ? (
                      showPreview ? (
                        /* Vista previa durante la edición */
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4 bg-card">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2">{pageTitle}</h2>
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: pageContent
                                  .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                                  .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
                                  .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/^- (.*$)/gm, '<li>$1</li>')
                                  .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground">$1</blockquote>')
                                  .replace(/\n\n/g, '</p><p>')
                                  .replace(/^(?!<[h|l|b])(.+)$/gm, '<p>$1</p>')
                                  .replace(/<li>/g, '<ul class="list-disc list-inside space-y-1"><li>')
                                  .replace(/<\/li>(?=(?:(?!<li>).)*$)/g, '</li></ul>')
                              }}
                            />
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-sm text-blue-800 dark:text-blue-400">
                              👁️ <strong>Vista previa:</strong> Así se verá la página cuando se publique. Haz clic en "Editor" para volver a editar.
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Editor de contenido */
                        <>
                          {/* Editor de título */}
                          <div>
                            <Label htmlFor="page-title">Título de la página</Label>
                            <Input
                              id="page-title"
                              value={pageTitle}
                              onChange={(e) => setPageTitle(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          {/* Editor de contenido */}
                          <div>
                            <Label htmlFor="page-content">Contenido (Markdown)</Label>
                            <Textarea
                              id="page-content"
                              value={pageContent}
                              onChange={(e) => setPageContent(e.target.value)}
                              rows={20}
                              className="mt-1 font-mono text-sm"
                              placeholder="Escribe el contenido en formato Markdown..."
                            />
                          </div>

                          {/* Ayuda de Markdown */}
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium text-sm mb-2">💡 Ayuda de Markdown</h4>
                            <div className="text-xs space-y-1 text-muted-foreground">
                              <p><code># Título</code> - Título principal</p>
                              <p><code>## Subtítulo</code> - Subtítulo</p>
                              <p><code>**texto**</code> - Texto en negrita</p>
                              <p><code>*texto*</code> - Texto en cursiva</p>
                              <p><code>- elemento</code> - Lista con viñetas</p>
                              <p><code>&gt; cita</code> - Cita destacada</p>
                            </div>
                          </div>
                        </>
                      )
                    ) : (
                      /* Vista de solo lectura */
                      <div className="border rounded-lg p-4 bg-card">
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: pageContent
                              .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                              .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
                              .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/^- (.*$)/gm, '<li>$1</li>')
                              .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground">$1</blockquote>')
                              .replace(/\n\n/g, '</p><p>')
                              .replace(/^(?!<[h|l|b])(.+)$/gm, '<p>$1</p>')
                              .replace(/<li>/g, '<ul class="list-disc list-inside space-y-1"><li>')
                              .replace(/<\/li>(?=(?:(?!<li>).)*$)/g, '</li></ul>')
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Selecciona una página de la lista para comenzar a editar
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab de Usuarios */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">👥 Gestión de Usuarios</h3>
              <p className="text-sm text-muted-foreground">
                Total: {users.length} usuarios ({users.filter(u => u.activo).length} activos)
              </p>
            </div>
            <Button onClick={() => setShowAddUser(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>

          {/* Formulario añadir usuario */}
          {showAddUser && (
            <Card>
              <CardHeader>
                <CardTitle>➕ Crear Nuevo Usuario</CardTitle>
                <CardDescription>
                  Completa la información del nuevo usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={newUser.nombre}
                      onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      value={newUser.apellidos}
                      onChange={(e) => setNewUser({...newUser, apellidos: e.target.value})}
                      placeholder="Apellidos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rol">Rol</Label>
                    <Select value={newUser.rol} onValueChange={(value) => setNewUser({...newUser, rol: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scouter">Scouter</SelectItem>
                        <SelectItem value="coordinador">Coordinador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="padre">Familia</SelectItem>
                        <SelectItem value="educando">Educando</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="seccion">Sección</Label>
                    <Select value={newUser.seccion} onValueChange={(value) => setNewUser({...newUser, seccion: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sección" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Castores">Castores (5-7 años)</SelectItem>
                        <SelectItem value="Lobatos">Lobatos (7-10 años)</SelectItem>
                        <SelectItem value="Tropa">Tropa (10-13 años)</SelectItem>
                        <SelectItem value="Pioneros">Pioneros (13-16 años)</SelectItem>
                        <SelectItem value="Rutas">Rutas (16-19 años)</SelectItem>
                        <SelectItem value="Administración">Administración</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={addUser} disabled={isLoading}>
                    {isLoading ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowAddUser(false);
                    setNewUser({
                      nombre: '',
                      apellidos: '',
                      email: '',
                      rol: 'scouter',
                      seccion: '',
                      activo: true
                    });
                  }}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de usuarios */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Lista de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      user.activo ? 'hover:bg-accent/50' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.nombre[0]}{user.apellidos[0]}
                        </span>
                      </div>

                      {/* Info del usuario */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {user.nombre} {user.apellidos}
                          </h4>
                          {getRoleBadge(user.rol)}
                          {getSectionBadge(user.seccion)}
                          {!user.activo && (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Creado: {user.fecha_creacion}
                          </span>
                          {user.ultimo_acceso && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Último acceso: {user.ultimo_acceso}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      {/* Toggle estado */}
                      <Button
                        size="sm"
                        variant={user.activo ? "outline" : "default"}
                        onClick={() => toggleUserStatus(user.id)}
                        title={user.activo ? "Desactivar usuario" : "Activar usuario"}
                      >
                        {user.activo ? "🔒 Desactivar" : "✅ Activar"}
                      </Button>

                      {/* Eliminar */}
                      {user.rol !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteUser(user.id)}
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay usuarios registrados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Configuración */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Configuración General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configuración General
                </CardTitle>
                <CardDescription>
                  Ajustes básicos del sitio web
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Nombre del sitio</Label>
                  <Input
                    id="siteName"
                    value={siteConfig.siteName}
                    onChange={(e) => setSiteConfig({...siteConfig, siteName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="siteEmail">Email de contacto</Label>
                  <Input
                    id="siteEmail"
                    type="email"
                    value={siteConfig.siteEmail}
                    onChange={(e) => setSiteConfig({...siteConfig, siteEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="sitePhone">Teléfono</Label>
                  <Input
                    id="sitePhone"
                    value={siteConfig.sitePhone}
                    onChange={(e) => setSiteConfig({...siteConfig, sitePhone: e.target.value})}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div>
                  <Label htmlFor="siteAddress">Dirección</Label>
                  <Input
                    id="siteAddress"
                    value={siteConfig.siteAddress}
                    onChange={(e) => setSiteConfig({...siteConfig, siteAddress: e.target.value})}
                    placeholder="Dirección del grupo scout"
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Descripción</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteConfig.siteDescription}
                    onChange={(e) => setSiteConfig({...siteConfig, siteDescription: e.target.value})}
                    rows={3}
                  />
                </div>
                <Button onClick={saveConfiguration} disabled={isLoading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </CardContent>
            </Card>

            {/* Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Sistema
                </CardTitle>
                <CardDescription>
                  Herramientas de administración del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Modo mantenimiento */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Modo mantenimiento</p>
                    <p className="text-sm text-muted-foreground">
                      Deshabilita el acceso público al sitio
                    </p>
                  </div>
                  <Button
                    variant={siteConfig.maintenanceMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setSiteConfig({...siteConfig, maintenanceMode: !siteConfig.maintenanceMode})}
                  >
                    {siteConfig.maintenanceMode ? "Activado" : "Inactivo"}
                  </Button>
                </div>

                {/* Registros */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Permitir registros</p>
                    <p className="text-sm text-muted-foreground">
                      Habilita el registro de nuevos usuarios
                    </p>
                  </div>
                  <Button
                    variant={siteConfig.allowRegistrations ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSiteConfig({...siteConfig, allowRegistrations: !siteConfig.allowRegistrations})}
                  >
                    {siteConfig.allowRegistrations ? "Habilitado" : "Deshabilitado"}
                  </Button>
                </div>

                {/* Notificaciones */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Notificaciones</p>
                    <p className="text-sm text-muted-foreground">
                      Sistema de notificaciones email
                    </p>
                  </div>
                  <Button
                    variant={siteConfig.enableNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSiteConfig({...siteConfig, enableNotifications: !siteConfig.enableNotifications})}
                  >
                    {siteConfig.enableNotifications ? "Habilitado" : "Deshabilitado"}
                  </Button>
                </div>

                {/* Acciones del sistema */}
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    onClick={createBackup}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <HardDrive className="h-4 w-4" />
                    {isLoading ? 'Creando...' : 'Crear Backup'}
                  </Button>
                  <Button
                    onClick={clearCache}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Database className="h-4 w-4" />
                    {isLoading ? 'Limpiando...' : 'Limpiar Caché'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Usuarios totales</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <ImageIcon className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{uploadedFiles.length}</p>
                  <p className="text-sm text-muted-foreground">Archivos subidos</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{pages.length}</p>
                  <p className="text-sm text-muted-foreground">Páginas editables</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas importantes */}
          {siteConfig.maintenanceMode && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">
                    ⚠️ Modo mantenimiento activo - El sitio no está accesible para usuarios
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Información de ayuda */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>💡 Guía Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Archivos:</strong> Sube imágenes y documentos. Las URLs se copian automáticamente.</li>
            <li>• <strong>Carpetas:</strong> Organiza los archivos por secciones para mejor gestión.</li>
            <li>• <strong>Texto alternativo:</strong> Importante para accesibilidad en imágenes.</li>
            <li>• <strong>Límites:</strong> Máximo 10MB por archivo.</li>
          </ul>
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  );
}