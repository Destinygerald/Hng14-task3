import { prisma } from "../lib/prisma.js";

export class TokenRepository {
  constructor() {
    this.model = prisma.refreshToken;
  }

  async create(data) {
    const response = await this.model.create({
      data: data,
    });

    return response;
  }

  async edit(data) {
    const response = await this.model.update({
      where: {
        github_id: data.github_id,
      },
      data: {
        username: githubData.login,
        avatar_url: githubData.avatar_url,
        last_login_at: new Date(),
      },
    });

    return response;
  }

  async getTokenData(refresh_token) {
    const response = await this.model.findUnique({
      where: { token: refresh_token },
      include: { user: true },
    });

    return response;
  }

  async deleteToken(refresh_token) {
    const response = await this.model.delete({
      where: { token: refresh_token },
    });
    return response;
  }
}
