import axiosClient from './axiosClient';

const getCircles = async () => {
  const response = await axiosClient.get('/community/circles');
  return response.data;
};

const joinCircle = async (circleId) => {
  const response = await axiosClient.post(`/community/circles/${circleId}/join`);
  return response.data;
};

const leaveCircle = async (circleId) => {
  const response = await axiosClient.post(`/community/circles/${circleId}/leave`);
  return response.data;
};

const getCircleMessages = async (circleId) => {
  const response = await axiosClient.get(`/community/circles/${circleId}/messages`);
  return response.data;
};

const sendCircleMessage = async (circleId, message, isAnonymous) => {
  const response = await axiosClient.post(`/community/circles/${circleId}/messages`, { message, isAnonymous });
  return response.data;
};

const getPosts = async () => {
  const response = await axiosClient.get('/community/posts');
  return response.data;
};

const createPost = async (postData) => {
  const response = await axiosClient.post('/community/posts', postData);
  return response.data;
};

const deletePost = async (postId) => {
  const response = await axiosClient.delete(`/community/posts/${postId}`);
  return response.data;
};

const getPostReplies = async (postId) => {
  const response = await axiosClient.get(`/community/posts/${postId}/replies`);
  return response.data;
};

const createPostReply = async (postId, content, anonymous) => {
  const response = await axiosClient.post(`/community/posts/${postId}/replies`, { content, anonymous });
  return response.data;
};

export default {
  getCircles,
  joinCircle,
  leaveCircle,
  getCircleMessages,
  sendCircleMessage,
  getPosts,
  createPost,
  deletePost,
  getPostReplies,
  createPostReply
};
