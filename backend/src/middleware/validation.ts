import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Validation middleware factory
 * Validates request body, query, or params against a Zod schema
 */
export function validate<T extends AnyZodObject>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      
      // Replace the source with validated data (transforms applied)
      req[source] = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: firstIssue.message,
            field: firstIssue.path.join('.'),
          },
        });
        return;
      }

      console.error('Validation error:', error);
      res.status(500).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed.',
        },
      });
    }
  };
}
