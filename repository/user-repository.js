import { prisma } from "../lib/prisma.js";

export class UserRepository {
  constructor() {
    this.model = prisma.user;
  }

  async create(data) {
    const response = await this.model.create({
      data: data,
    });

    return response;
  }

  async getUser(id) {
    const response = await this.model.findUnique({
      where: {
        github_id: id,
      },
    });

    return response;
  }

  async editUser(data) {
    const response = await this.model.update({
      where: {
        github_id: data.github_id,
      },
      data: {
        username: data.login,
        avatar_url: data.avatar_url,
        last_login_at: new Date(),
      },
    });

    return response;
  }
}
