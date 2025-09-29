'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Settings, Users, Image as ImageIcon, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 🏕️ PANEL DE ADMINISTRACIÓN CMS - GRUPO SCOUT OSYRIS
 * Panel exclusivo para super_admin
 */

export default function AdminPanel() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState('general');
  const [altText, setAltText] = useState('');

  // Cargar archivos subidos
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/uploads`, {
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

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'El archivo no puede superar los 10MB',
          variant: 'destructive'
        });
        return;
      }

      setSelectedFile(file);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/uploads`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/uploads/${fileId}`, {
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

  return (
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
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Archivo (máx 10MB)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf,.doc,.docx"
                    className="w-full p-2 border rounded"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Seleccionado: {selectedFile.name}
                    </p>
                  )}
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
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                      <div className="flex items-center space-x-2 flex-1">
                        {file.file_type?.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.original_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {file.folder} • {(file.file_size / 1024).toFixed(1)}KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(file.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(file.file_url);
                            toast({
                              title: '📋 Copiado',
                              description: 'URL copiada al portapapeles'
                            });
                          }}
                        >
                          📋
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleDelete(file.id)}
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
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>📄 Editor de Páginas</CardTitle>
              <CardDescription>
                Edita el contenido de las páginas del sitio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-12">
                🚧 Editor de páginas en desarrollo...
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Próximamente podrás editar todos los textos del sitio desde aquí
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Usuarios */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>👥 Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra los usuarios y sus permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-12">
                🚧 Gestión de usuarios en desarrollo...
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Próximamente podrás gestionar usuarios y asignar roles
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Configuración */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Configuración del Sitio</CardTitle>
              <CardDescription>
                Ajustes generales del sitio web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-12">
                🚧 Configuración en desarrollo...
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Próximamente podrás configurar aspectos generales del sitio
              </p>
            </CardContent>
          </Card>
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
  );
}