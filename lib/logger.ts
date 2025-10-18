/**
 * Professional Logging System
 * Structured logging with different levels
 */

import { env } from './env';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isProduction = env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, metadata } = entry;
    
    if (this.isProduction) {
      // JSON format for production (for log aggregation)
      return JSON.stringify({
        level,
        message,
        timestamp,
        context,
        ...metadata,
      });
    }
    
    // Human-readable format for development
    const contextStr = context ? `[${context}]` : '';
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    return `${timestamp} ${level} ${contextStr} ${message}${metadataStr}`;
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      metadata,
      error,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        if (!this.isProduction) console.log(formattedLog);
        break;
      case LogLevel.INFO:
        console.log(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog, error);
        break;
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context, metadata, error);
  }
}

export const logger = new Logger();
