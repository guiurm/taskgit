import { tmpdir } from 'node:os';
import path from 'node:path';

const TMP_DIR = path.join(tmpdir(), 'taskgit');
const TMP_PATCH_DIR = path.join(TMP_DIR, 'patch');

const NAME = '@guiurm/taskgit';
const VERSION = '1.0.0-rc.2';
const VERSION_NAME = `${NAME}@${VERSION}`;

const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_TEST = process.env.NODE_ENV === 'test';

const LOG_SPLITTER = '_$ ò $_';

const COMMIT_STANDARD_TYPES = [
    {
        icon: '🚀',
        name: 'feat',
        description: 'Agregar una nueva funcionalidad o característica al proyecto.'
    },
    { icon: '🐛', name: 'fix', value: 'fix', description: 'Corregir un error o bug en el código.' },
    {
        icon: '📚',
        name: 'docs',
        description: 'Actualizar o modificar la documentación del proyecto (README, comentarios, etc.).'
    },
    {
        icon: '🎨',
        name: 'style',
        description: 'Cambios en el formato o estilo del código, sin afectar la funcionalidad.'
    },
    {
        icon: '♻️',
        name: 'refactor',
        description: 'Reestructuración del código para mejorar su calidad o rendimiento, sin cambiar su comportamiento.'
    },
    {
        icon: '⚡',
        name: 'performance',
        description: 'Mejoras en el rendimiento del proyecto sin afectar su funcionalidad.'
    },
    {
        icon: '🧪',
        name: 'test',
        description: 'Añadir o modificar pruebas (unitarias, de integración) para mejorar la cobertura del código.'
    },
    {
        icon: '🧹',
        name: 'chore',
        description:
            'Tareas de mantenimiento, configuración o administración, que no afectan la funcionalidad del proyecto.'
    },
    {
        icon: '🏗️',
        name: 'build',
        description:
            'Cambios relacionados con la construcción del proyecto, como dependencias, compilación o configuración.'
    },
    {
        icon: '⚙️',
        name: 'ci',
        description: 'Cambios en la configuración de integración continua o en los pipelines de CI/CD.'
    },
    {
        icon: '🚀',
        name: 'release',
        description: 'Realizar un lanzamiento o actualización de la versión del proyecto.'
    },
    {
        icon: '❌',
        name: 'removed',
        description: 'Eliminar funcionalidades obsoletas o innecesarias.'
    },
    {
        icon: '📉',
        name: 'deprecated',
        description: 'Marcar funcionalidades como obsoletas y que serán eliminadas en el futuro.'
    },
    {
        icon: '🔒',
        name: 'security',
        description: 'Cambios relacionados con la seguridad, como actualizaciones para mitigar vulnerabilidades.'
    },
    { icon: '⏪', name: 'revert', value: 'revert', description: 'Deshacer cambios realizados en un commit anterior.' },
    {
        icon: '⚒️',
        name: 'wip',
        description: 'Trabajo en progreso, commit incompleto que refleja cambios aún en desarrollo.'
    }
] as const;

export { COMMIT_STANDARD_TYPES, IS_DEV, IS_TEST, LOG_SPLITTER, NAME, TMP_DIR, TMP_PATCH_DIR, VERSION, VERSION_NAME };
