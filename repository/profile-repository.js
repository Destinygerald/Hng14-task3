import { prisma } from "../lib/prisma.js";

export class ProfileRepository {
  constructor() {
    this.model = prisma.profile;
    this.prisma = prisma;
  }

  async create(data) {
    const response = await this.model.create({
      data: data,
    });

    return response;
  }

  async createMany(data) {
    const response = await this.model.createMany({
      data: data,
    });

    return response;
  }

  async getMany(query) {
    const page = query.page || 1;
    const pageSize = query.limit <= 50 && query.limit >= 10 ? query.limit : 10;

    const skip = (page - 1) * pageSize;

    const [data, totalCount] = await this.prisma.$transaction([
      this.model.findMany({
        where: query.where,
        take: parseInt(pageSize),
        skip: parseInt(skip),
        orderBy: {
          [query.sort_by || "created_at"]: query.order || "asc",
        },
      }),
      this.model.count({
        where: query.where,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data,
      totalPages,
      limit: pageSize,
      page,
    };
  }

  async getByName(name) {
    const response = await this.model.findUnique({
      where: { name: name },
    });
  }
}
