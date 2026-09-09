export class Router {
  static getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      status: params.get('status') || 'all',
      priority: params.get('priority') || 'all',
      sort: params.get('sort') || 'createdAt'
    };
  }

  static updateParams(filters) {
    const url = new URL(window.location);
    if (filters.status && filters.status !== 'all') url.searchParams.set('status', filters.status);
    else url.searchParams.delete('status');

    if (filters.priority && filters.priority !== 'all') url.searchParams.set('priority', filters.priority);
    else url.searchParams.delete('priority');

    if (filters.sort && filters.sort !== 'createdAt') url.searchParams.set('sort', filters.sort);
    else url.searchParams.delete('sort');

    window.history.pushState({}, '', url);
  }
}
