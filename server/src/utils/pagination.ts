import { Request } from 'express';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: T[];
}

export const paginate = async <T>(
  model: any,
  query: any,
  req: Request
): Promise<PaginationResult<T>> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model
      .find(query)
      .limit(limit)
      .skip(skip)
      .sort({ [sortBy]: sortOrder }),
    model.countDocuments(query)
  ]);

  const pages = Math.ceil(total / limit);

  return {
    success: true,
    count: data.length,
    pagination: {
      page,
      limit,
      total,
      pages
    },
    data
  };
};

export const buildQueryFilters = (req: Request, allowedFilters: string[]) => {
  const filters: any = {};

  allowedFilters.forEach(field => {
    if (req.query[field]) {
      filters[field] = req.query[field];
    }
  });

  // Date range filtering
  if (req.query.startDate || req.query.endDate) {
    filters.createdAt = {};
    if (req.query.startDate) {
      filters.createdAt.$gte = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filters.createdAt.$lte = new Date(req.query.endDate as string);
    }
  }

  // Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search as string, 'i');
    filters.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { notes: searchRegex }
    ];
  }

  return filters;
};
