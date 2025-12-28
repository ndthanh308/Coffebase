import { AboutModel } from '../../domain-layer/models/about-model.js';

export class AboutService {
  async getAbout() {
    const rows = await AboutModel.listActive();

    const groupRow = rows.find((r) => r.type === 'group') || null;
    const members = rows.filter((r) => r.type === 'member');

    return {
      group: groupRow
        ? {
            id: groupRow.id,
            name: groupRow.name,
            description: groupRow.description || ''
          }
        : null,
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        title: m.title || '',
        roles: Array.isArray(m.roles) ? m.roles : [],
        motto: m.motto || '',
        image_url: m.image_url || null,
        sort_order: m.sort_order || 0
      }))
    };
  }
}
