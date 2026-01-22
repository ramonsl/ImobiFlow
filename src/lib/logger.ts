const isDev = process.env.NODE_ENV === 'development';
const isDebug = process.env.DEBUG === 'true';

export const logger = {
    info: (...args: any[]) => {
        console.log('🔵 [INFO]:', ...args);
    },
    warn: (...args: any[]) => {
        console.warn('🟠 [WARN]:', ...args);
    },
    error: (...args: any[]) => {
        console.error('🔴 [ERROR]:', ...args);
    },
    debug: (...args: any[]) => {
        if (isDev || isDebug) {
            console.log('🧪 [DEBUG]:', ...args);
        }
    }
};

export async function logSecurityEvent(params: any) {
    // Simplified version for now
    logger.info(`Security event: ${params.event}`, params.details);
}
