import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues
    });
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  return res.status(500).json({ message });
};
