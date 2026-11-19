export const environment = {
  production: true,
  get apiUrl() {
    return `http://${window.location.hostname}:8000/api`;
  },
};
