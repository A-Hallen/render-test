# Guía de Despliegue Completo en AWS con Docker (Ecuador)

## 1. Preparación Local

### 1.3 Obtener Credenciales de AWS

1. Crear cuenta en AWS:
   - Visitar: https://aws.amazon.com/
   - Hacer clic en "Crear cuenta"
   - Seguir los pasos de registro
   - Verificar correo electrónico

2. Crear IAM User:
   1. Iniciar sesión en la consola de AWS
   2. Ir a "Services" > "IAM"
   3. En el menú izquierdo, hacer clic en "Users"
   4. Hacer clic en "Add user"
   5. Configurar el nuevo usuario:
      - Nombre de usuario: [tu-nombre-de-usuario]
      - Tipo de acceso: Programmatic access
   6. Configurar permisos:
      - Crear grupo nuevo
      - Asignar políticas:
        - AmazonEC2FullAccess
        - AmazonS3FullAccess
        - AmazonElasticContainerRegistryFullAccess
        - AmazonElasticContainerServiceFullAccess
        - CloudWatchFullAccess
   7. Hacer clic en "Next: Tags"
   8. Hacer clic en "Next: Review"
   9. Hacer clic en "Create user"

3. Obtener credenciales:
   - Después de crear el usuario, AWS mostrará las credenciales:
     - Access key ID: AKIA...
     - Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY
   - **Importante**: Guardar estas credenciales en un lugar seguro
   - **Importante**: No compartirlas con nadie
   - **Importante**: Si pierdes las credenciales, tendrás que crear nuevas

4. Configurar credenciales en AWS CLI:
   ```bash
   aws configure
   ```
   - Ingresar Access Key ID
   - Ingresar Secret Access Key
   - Seleccionar región: sa-east-1
   - Seleccionar formato de salida: json

5. Verificar configuración:
   ```bash
   aws sts get-caller-identity
   ```
   - Debería mostrar información del usuario recién creado

6. Mejores prácticas de seguridad:
   - Nunca compartir las credenciales
   - Usar roles IAM para diferentes servicios
   - Rotar las credenciales periódicamente
   - Usar MFA (Multi-Factor Authentication) para el acceso a la consola
   - Limitar los permisos según el principio de menor privilegio
   - Monitorear el uso de las credenciales con CloudTrail

7. Si pierdes las credenciales:
   1. Ir a IAM > Users
   2. Seleccionar tu usuario
   3. Hacer clic en "Security credentials"
   4. Hacer clic en "Create access key"
   5. Descargar las nuevas credenciales
   6. Actualizar la configuración de AWS CLI con las nuevas credenciales

2. Configurar AWS CLI:
   ```bash
   aws configure
   ```
   - Ingresar Access Key ID
   - Ingresar Secret Access Key
   - Seleccionar región: sa-east-1 (Sao Paulo, Brasil)
     - Esta es la región más cercana a Ecuador
     - Tiene mejor rendimiento y menor latencia
   - Seleccionar formato de salida: json

## 2. Construcción del Proyecto

### 2.1 Estructura de Archivos
1. Archivos principales en el directorio raíz:
   - `Dockerfile`: Construye el proyecto completo
   - `docker-compose.yml`: Orquesta los servicios
   - `shared/`: Código compartido
   - `backend/`: API y servicios
   - `frontend/`: Interfaz de usuario

## 3. Despliegue en AWS

### 3.1 ECR (Elastic Container Registry)
1. Crear repositorio:
   ```bash
   aws ecr create-repository --repository-name ais-asistente
   ```

2. Subir imagen:
   ```bash
   docker tag ais-asistente:latest <aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente:latest
   docker push <aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente:latest
   ```

### 3.2 ECS (Elastic Container Service)

1. Configurar Task Definition:
   ```json
   {
     "containerDefinitions": [
       {
         "name": "ais-asistente",
         "image": "<aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente:latest",
         "portMappings": [
           {"containerPort": 80, "hostPort": 80},
           {"containerPort": 3000, "hostPort": 3000}
         ]
       }
     ]
   }
   ```

2. Configurar Security Groups:
   - Backend: Puerto 3000
   - Frontend: Puertos 80 y 443
   - SSH: Puerto 22 (solo desde tu IP)

### 3.3 Configuración de Networking
1. Crear Application Load Balancer
2. Configurar Target Groups
3. Configurar listeners:
   - HTTP (puerto 80) -> Frontend
   - HTTPS (puerto 443) -> Frontend
   - Backend API (puerto 3000) -> Backend

## 4. Consideraciones de Seguridad y Monitoreo

### 4.1 Seguridad
1. IAM roles:
   - Role para ECS
   - Policy para ECR
   - Policy para CloudWatch
   - Policy para S3

2. Security Groups:
   - Permitir solo puertos necesarios
   - Configurar reglas de entrada/salida
   - Restringir acceso por IP

### 4.2 Monitoreo
1. CloudWatch:
   - Logs de backend y frontend
   - Métricas de rendimiento
   - Alarms para:
     - CPU usage
     - Memory usage
     - Network I/O
     - Tiempo de respuesta

## 5. Consideraciones de Costos y Mantenimiento

### 5.1 Costos
1. Monitorear costos:
   - Instancias EC2
   - ECR
   - ALB
   - S3
   - CloudWatch

2. Optimizaciones:
   - Usar instancias spot cuando sea posible
   - Configurar Auto Scaling
   - Usar Reserved Instances
   - Implementar políticas de apagado automático
   - Optimizar imágenes Docker

### 5.2 Mantenimiento
1. Actualizaciones:
   - Actualizar imágenes Docker
   - Desplegar nuevas versiones
   - Rollback si necesario

2. Backups:
   - Configurar snapshots de EBS
   - Configurar backups de base de datos
   - Configurar backups de S3

3. Monitoreo:
   - Verificar logs
   - Verificar métricas
   - Verificar estado de servicios
   - Verificar costos mensuales

## 2. Despliegue del Frontend y Backend

### 2.1 Construir Imágenes Docker

1. Backend:
   ```bash
   cd backend
   docker build -t ais-asistente-backend .
   ```

2. Frontend:
   ```bash
   cd frontend
   docker build -t ais-asistente-frontend .
   ```

### 2.2 Configuración de Variables de Entorno

1. Backend:
   ```
   NODE_ENV=production
   PORT=3000
   # Otras variables según necesidad
   ```

2. Frontend:
   ```
   VITE_API_URL=http://backend:3000
   ```

## 3. Configuración de AWS

### 3.1 ECR (Elastic Container Registry)
1. Crear repositorios:
   ```bash
   aws ecr create-repository --repository-name ais-asistente-backend
   aws ecr create-repository --repository-name ais-asistente-frontend
   ```

2. Subir imágenes:
   ```bash
   # Para el backend
   docker tag ais-asistente-backend:latest <aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente-backend:latest
   docker push <aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente-backend:latest

   # Para el frontend
   docker tag ais-asistente-frontend:latest <aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente-frontend:latest
   docker push <aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente-frontend:latest
   ```

### 3.2 ECS (Elastic Container Service)

1. Configurar Task Definition:
   ```json
   {
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "<aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente-backend:latest",
         "portMappings": [{"containerPort": 3000, "hostPort": 3000}]
       },
       {
         "name": "frontend",
         "image": "<aws-account-id>.dkr.ecr.sa-east-1.amazonaws.com/ais-asistente-frontend:latest",
         "portMappings": [{"containerPort": 80, "hostPort": 80}]
       }
     ]
   }
   ```

2. Configurar Security Groups:
   - Backend: Puerto 3000
   - Frontend: Puertos 80 y 443
   - SSH: Puerto 22 (solo desde tu IP)

### 3.3 Configuración de Networking
1. Crear Application Load Balancer
2. Configurar Target Groups
3. Configurar listeners:
   - HTTP (puerto 80) -> Frontend
   - HTTPS (puerto 443) -> Frontend
   - Backend API (puerto 3000) -> Backend

## 4. Consideraciones de Seguridad y Monitoreo

### 4.1 Seguridad
1. IAM roles:
   - Role para ECS
   - Policy para ECR
   - Policy para CloudWatch
   - Policy para S3

2. Security Groups:
   - Permitir solo puertos necesarios
   - Configurar reglas de entrada/salida
   - Restringir acceso por IP

### 4.2 Monitoreo
1. CloudWatch:
   - Logs de backend y frontend
   - Métricas de rendimiento
   - Alarms para:
     - CPU usage
     - Memory usage
     - Network I/O
     - Tiempo de respuesta

## 5. Consideraciones de Costos y Mantenimiento

### 5.1 Costos
1. Monitorear costos:
   - Instancias EC2
   - ECR
   - ALB
   - S3
   - CloudWatch

2. Optimizaciones:
   - Usar instancias spot cuando sea posible
   - Configurar Auto Scaling
   - Usar Reserved Instances
   - Implementar políticas de apagado automático
   - Optimizar imágenes Docker

### 5.2 Mantenimiento
1. Actualizaciones:
   - Actualizar imágenes Docker
   - Desplegar nuevas versiones
   - Rollback si necesario

2. Backups:
   - Configurar snapshots de EBS
   - Configurar backups de base de datos
   - Configurar backups de S3

3. Monitoreo:
   - Verificar logs
   - Verificar métricas
   - Verificar estado de servicios
   - Verificar costos mensuales

1. Instalar AWS CLI
   - Descargar desde: https://awscli.amazonaws.com/AWSCLIV2.msi
   - Ejecutar el instalador

2. Configurar AWS CLI:
   ```bash
   aws configure
   ```
   - Ingresar Access Key ID
   - Ingresar Secret Access Key
   - Seleccionar región: sa-east-1 (Sao Paulo, Brasil)
     - Esta es la región más cercana a Ecuador
     - Tiene mejor rendimiento y menor latencia
   - Seleccionar formato de salida: json

### 1.3 Configuración de AWS para Ecuador
1. Crear un bucket S3 en la región sa-east-1
2. Configurar grupos de seguridad para permitir acceso desde Ecuador
3. Configurar las instancias EC2 con:
   - Tipo de instancia: t2.medium (balance entre costo y rendimiento)
   - Ubicación: sa-east-1
   - Security Groups configurados para permitir:
     - Puerto 80 (HTTP)
     - Puerto 443 (HTTPS)
     - Puerto 22 (SSH, solo desde tu IP)
     - Puerto 3000 (para tu aplicación)

### 1.4 Consideraciones de Costos para Ecuador
- Monitorear los costos de AWS usando AWS Cost Explorer
- Configurar alertas de costos en AWS Billing
- Optimizar recursos:
  - Usar instancias spot cuando sea posible
  - Configurar Auto Scaling
  - Usar Reserved Instances para carga constante
  - Implementar políticas de apagado automático

## 2. Crear Imagen Docker

1. Construir imagen:
   ```bash
   docker build -t ais-asistente-backend .
   ```

2. Verificar imagen:
   ```bash
   docker images
   ```

## 3. Configurar AWS ECR (Elastic Container Registry)

1. Crear repositorio:
   ```bash
   aws ecr create-repository --repository-name ais-asistente-backend
   ```

2. Obtener credenciales de autenticación:
   ```bash
   aws ecr get-login-password --region <tu-region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com
   ```

3. Etiquetar y subir imagen:
   ```bash
   docker tag ais-asistente-backend:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/ais-asistente-backend:latest
   docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/ais-asistente-backend:latest
   ```

## 4. Configurar ECS (Elastic Container Service)

### 4.1 Crear Cluster ECS
1. En la consola de AWS:
   - Ir a ECS
   - Crear nuevo cluster
   - Seleccionar "EC2 Linux + Networking"
   - Configurar:
     - Nombre del cluster
     - Tamaño de instancia EC2 (recomendado: t2.medium)
     - Número de instancias (1 para inicio)
     - Grupo de seguridad

### 4.2 Crear Task Definition
1. En ECS:
   - Crear nueva Task Definition
   - Configurar:
     - Nombre: ais-asistente-task
     - Network mode: awsvpc
     - CPU: 512
     - Memoria: 1024
     - Imagen: <aws-account-id>.dkr.ecr.<region>.amazonaws.com/ais-asistente-backend:latest
     - Puerto: 3000
     - Variables de entorno:
       - NODE_ENV: production
       - Otras variables según necesidad

### 4.3 Crear Servicio
1. En ECS:
   - Crear nuevo servicio
   - Seleccionar cluster
   - Configurar:
     - Nombre del servicio
     - Task Definition
     - Número de tareas (1 para inicio)
     - Balanceador de carga:
       - Crear nuevo Application Load Balancer
       - Configurar listeners (puerto 80)
       - Configurar target group

## 5. Configuración de Variables de Entorno

1. Crear archivo `.env` con:
   ```
   NODE_ENV=production
   PORT=3000
   # Otras variables según necesidad
   ```

2. Variables sensibles en AWS Secrets Manager:
   - Base de datos
   - Claves API
   - Tokens

## 6. Monitoreo y Logging

1. Configurar CloudWatch:
   - Logs de aplicación
   - Métricas de rendimiento
   - Alarms para:
     - CPU usage
     - Memory usage
     - Network I/O

2. Configurar CloudWatch Logs Agent:
   - Instalar en EC2 instances
   - Configurar para enviar logs a CloudWatch

## 7. Seguridad

1. Configurar IAM roles:
   - Role para ECS
   - Policy para ECR
   - Policy para CloudWatch

2. Configurar Security Groups:
   - Permitir solo puertos necesarios
   - Configurar reglas de entrada/salida

3. Configurar VPC:
   - Subnets públicas/privadas
   - NAT Gateway
   - Route Tables

## 8. Escalabilidad

1. Configurar Auto Scaling:
   - Basado en CPU usage
   - Basado en memoria
   - Basado en request count

2. Configurar Load Balancer:
   - Session stickiness
   - Health checks
   - SSL/TLS

## 9. Mantenimiento

1. Actualizaciones:
   - Actualizar Task Definition
   - Desplegar nueva versión
   - Rollback si necesario

2. Backups:
   - Configurar snapshots de EBS
   - Configurar backups de base de datos

3. Monitoreo de recursos:
   - Verificar uso de CPU/Memoria
   - Verificar logs
   - Verificar métricas de rendimiento

## 10. Consideraciones Finales

1. Costos:
   - Monitorear costos de EC2
   - Monitorear costos de ECR
   - Monitorear costos de ALB

2. Seguridad:
   - Mantener actualizadas las imágenes
   - Actualizar IAM roles
   - Revisar políticas de seguridad

3. Performance:
   - Optimizar recursos EC2
   - Configurar correctamente el Load Balancer
   - Monitorear métricas de rendimiento
