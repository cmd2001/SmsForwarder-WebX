import axios from 'axios';
import config from './config';
import { redirect } from 'react-router';

export const cleanToken = () => {
  localStorage.removeItem('accessToken');
};

export const redirectToLogin = () => {
  cleanToken();
  const redirectUrl = encodeURIComponent(window.location.pathname);
  window.location.href = `/login?redirectUrl=${redirectUrl}`;
};

export const fetchConversations = async (
  start: number = 0,
  limit: number = 10,
) => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const response = await axios.get(
      `${config.backendUrl}/api/v1/conversation/list?start=${start}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (err) {
    if ((err as any).response.status === 401) {
      redirectToLogin();
    }
    throw err;
  }
};

export const fetchMessages = async (
  conversationId: string,
  start: number,
  limit: number,
) => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const response = await axios.get(
      `${config.backendUrl}/api/v1/conversation?id=${conversationId}&start=${start}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (err) {
    if ((err as any).response.status === 401) {
      redirectToLogin();
    }
    throw err;
  }
};

export const sendMessage = async (conversationId: string, content: string) => {
  const accessToken = localStorage.getItem('accessToken');
  try {
    const response = await axios.post(
      `${config.backendUrl}/api/v1/conversation`,
      {
        conversation_id: conversationId,
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (err) {
    if ((err as any).response.status === 401) {
      redirectToLogin();
    }
    throw err;
  }
};

export const handleLogin = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${config.backendUrl}/api/v1/login`, {
      username,
      password,
    });
    const accessToken = response.data.access_token;
    localStorage.setItem('accessToken', accessToken);
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirectUrl') || '/';
    window.location.href = redirectUrl;
  } catch (err) {
    throw err;
  }
};
