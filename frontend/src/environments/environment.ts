export const environment = {
  production: false,
  get apiUrl() {
    return `http://${window.location.hostname}:8000/api`;
  },
};
