import { API_URL } from "@/config/env";
import fetch from "@/utils/ajax";

export const getBundle = async (params) => {
  return await fetch.get(`${API_URL}/render/list-bd`, {
    params,
  });
};

export const getOffer = async (params) => {
  return await fetch.get(`${API_URL}/render/list-of`, {
    params,
  });
};

export const getDiscount = async (params) => {
  return await fetch.get(`${API_URL}/render/handle-promotion`, {
    params,
  });
};

export const getFeature = async (params) => {
  return await fetch.get(`${API_URL}/render/settings-all
`, {
    params,
  });
};

export const getOrders = async (params) => {
  return await fetch.get(`${API_URL}/render/settings-all
`, {
    params,
  });
};


export default {
  getBundle,
  getOffer,
  getDiscount,
  getFeature,
  getOrders,
};
