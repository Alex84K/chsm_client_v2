const devApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006';

export const url = window.location.hostname;
let prodApiUrl = ''

if(url == "brass.chsm.pro") {
  prodApiUrl = "https://serv.chsm.pro"
}

export const apiUrl: string | undefined = import.meta.env.DEV
  ? devApiUrl
  : prodApiUrl;
