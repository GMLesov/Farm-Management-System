import { Request, Response, NextFunction } from 'express';
import { notFoundHandler } from '../src/middleware/notFoundHandler';

describe('notFoundHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      originalUrl: '/api/invalid-endpoint',
      method: 'GET',
    };
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    
    mockNext = jest.fn();
  });

  it('should return 404 status code', () => {
    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(statusMock).toHaveBeenCalledWith(404);
  });

  it('should return error response with correct structure', () => {
    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Route not found',
      message: 'The requested endpoint GET /api/invalid-endpoint does not exist',
      statusCode: 404,
    });
  });

  it('should handle POST requests', () => {
    mockRequest.method = 'POST';
    mockRequest.originalUrl = '/api/nonexistent';

    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Route not found',
      message: 'The requested endpoint POST /api/nonexistent does not exist',
      statusCode: 404,
    });
  });

  it('should handle PUT requests', () => {
    mockRequest.method = 'PUT';
    mockRequest.originalUrl = '/api/users/999';

    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Route not found',
      message: 'The requested endpoint PUT /api/users/999 does not exist',
      statusCode: 404,
    });
  });

  it('should handle DELETE requests', () => {
    mockRequest.method = 'DELETE';
    mockRequest.originalUrl = '/api/data/123';

    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Route not found',
      message: 'The requested endpoint DELETE /api/data/123 does not exist',
      statusCode: 404,
    });
  });

  it('should handle routes with query parameters', () => {
    mockRequest.originalUrl = '/api/search?query=test&limit=10';

    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Route not found',
      message: 'The requested endpoint GET /api/search?query=test&limit=10 does not exist',
      statusCode: 404,
    });
  });

  it('should handle root path', () => {
    mockRequest.originalUrl = '/';

    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Route not found',
      message: 'The requested endpoint GET / does not exist',
      statusCode: 404,
    });
  });
});
