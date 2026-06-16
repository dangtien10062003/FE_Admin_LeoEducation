const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const buildUrl = (path, params) => {
  const url = `${API_BASE}${path}`;
  if (!params) return url;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(buildUrl(path, options.params), {
    ...options,
    headers,
  });
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
    }
    throw new Error(payload?.message || `HTTP ${res.status}`);
  }

  if (payload && payload.success === false) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

const body = (data) => JSON.stringify(data);
const withPaging = (params = {}) => ({ pageIndex: 1, pageSize: 100, ...params });

export const authService = {
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: body(data) }),
  me: () => apiRequest('/auth/me'),
  changePassword: (data) => apiRequest('/auth/change-password', { method: 'POST', body: body(data) }),
};

export const coursesService = {
  list: (params = {}) => apiRequest('/courses', { params: withPaging(params) }),
  detail: (id) => apiRequest(`/courses/${id}`),
  create: (data) => apiRequest('/courses', { method: 'POST', body: body(data) }),
  update: (id, data) => apiRequest(`/courses/${id}`, { method: 'PUT', body: body(data) }),
  remove: (id) => apiRequest(`/courses/${id}`, { method: 'DELETE' }),
};

export const classesService = {
  list: (params = {}) => apiRequest('/classes', { params: withPaging(params) }),
  detail: (id) => apiRequest(`/classes/${id}`),
  availableStudents: (params = {}) => apiRequest('/classes/available-students', { params }),
  create: (data) => apiRequest('/classes', { method: 'POST', body: body(data) }),
  update: (id, data) => apiRequest(`/classes/${id}`, { method: 'PUT', body: body(data) }),
  remove: (id) => apiRequest(`/classes/${id}`, { method: 'DELETE' }),
};

export const subjectsService = {
  list: (params = {}) => apiRequest('/subjects', { params: withPaging({ includeInactive: true, ...params }) }),
  create: (data) => apiRequest('/subjects', { method: 'POST', body: body(data) }),
  update: (id, data) => apiRequest(`/subjects/${id}`, { method: 'PUT', body: body(data) }),
  remove: (id) => apiRequest(`/subjects/${id}`, { method: 'DELETE' }),
};

export const registrationsService = {
  list: (params = {}) => apiRequest('/registrations', { params: withPaging(params) }),
  create: (data) => apiRequest('/registrations', { method: 'POST', body: body(data) }),
  update: (id, data) => apiRequest(`/registrations/${id}`, { method: 'PUT', body: body(data) }),
  updateStatus: (id, status) => apiRequest(`/registrations/${id}`, { method: 'PATCH', body: body({ status }) }),
  remove: (id) => apiRequest(`/registrations/${id}`, { method: 'DELETE' }),
};

export const contactsService = {
  list: (params = {}) => apiRequest('/contact', { params: withPaging(params) }),
  create: (data) => apiRequest('/contact', { method: 'POST', body: body(data) }),
  update: (id, data) => apiRequest(`/contact/${id}`, { method: 'PUT', body: body(data) }),
  updateStatus: (id, status) => apiRequest(`/contact/${id}`, { method: 'PATCH', body: body({ status }) }),
  remove: (id) => apiRequest(`/contact/${id}`, { method: 'DELETE' }),
};

export const instructorsService = {
  list: (params = {}) => apiRequest('/instructors', { params: withPaging(params) }),
  create: (data) => apiRequest('/instructors', { method: 'POST', body: body(data) }),
  update: (id, data) => apiRequest(`/instructors/${id}`, { method: 'PUT', body: body(data) }),
  remove: (id) => apiRequest(`/instructors/${id}`, { method: 'DELETE' }),
};

export const testimonialsService = {
  list: (params = {}) => apiRequest('/testimonials', { params: withPaging({ includeInactive: true, ...params }) }),
  create: (data) => apiRequest('/testimonials', { method: 'POST', body: body(data) }),
  update: (id, data) => apiRequest(`/testimonials/${id}`, { method: 'PUT', body: body(data) }),
  remove: (id) => apiRequest(`/testimonials/${id}`, { method: 'DELETE' }),
};

export const blogsService = {
  list: (params = {}) => apiRequest('/blogs', { params: withPaging(params) }),
  create: (data) => apiRequest('/blogs', { method: 'POST', body: body(data) }),
  update: (id, data) => apiRequest(`/blogs/${id}`, { method: 'PUT', body: body(data) }),
  remove: (id) => apiRequest(`/blogs/${id}`, { method: 'DELETE' }),
};

// Backward-compatible exports for existing pages.
export const login = authService.login;
export const getMe = authService.me;
export const changePassword = authService.changePassword;

export const getCourses = coursesService.list;
export const getCourseById = coursesService.detail;
export const createCourse = coursesService.create;
export const updateCourse = coursesService.update;
export const deleteCourse = coursesService.remove;

export const getClasses = classesService.list;
export const getClassById = classesService.detail;
export const getClassAvailableStudents = classesService.availableStudents;
export const createClass = classesService.create;
export const updateClass = classesService.update;
export const deleteClass = classesService.remove;

export const getSubjects = subjectsService.list;
export const createSubject = subjectsService.create;
export const updateSubject = subjectsService.update;
export const deleteSubject = subjectsService.remove;

export const getRegistrations = registrationsService.list;
export const createRegistration = registrationsService.create;
export const updateRegistration = registrationsService.update;
export const updateRegistrationStatus = registrationsService.updateStatus;
export const deleteRegistration = registrationsService.remove;

export const getContacts = contactsService.list;
export const createContact = contactsService.create;
export const updateContact = contactsService.update;
export const updateContactStatus = contactsService.updateStatus;
export const deleteContact = contactsService.remove;

export const getInstructors = instructorsService.list;
export const createInstructor = instructorsService.create;
export const updateInstructor = instructorsService.update;
export const deleteInstructor = instructorsService.remove;

export const getTestimonials = testimonialsService.list;
export const createTestimonial = testimonialsService.create;
export const updateTestimonial = testimonialsService.update;
export const deleteTestimonial = testimonialsService.remove;

export const getBlogs = blogsService.list;
export const createBlog = blogsService.create;
export const updateBlog = blogsService.update;
export const deleteBlog = blogsService.remove;

export const getStats = async () => {
  const results = await Promise.allSettled([
    getCourses({ limit: 100 }),
    getClasses({ pageSize: 100 }),
    getRegistrations({ pageSize: 100 }),
    getContacts({ pageSize: 100 }),
    getInstructors({ pageSize: 100 }),
    getTestimonials({ pageSize: 100 }),
    getBlogs({ pageSize: 100 }),
  ]);

  const courses = results[0].status === 'fulfilled' ? results[0].value : null;
  const classes = results[1].status === 'fulfilled' ? results[1].value : null;
  const regs = results[2].status === 'fulfilled' ? results[2].value : null;
  const contacts = results[3].status === 'fulfilled' ? results[3].value : null;
  const instructors = results[4].status === 'fulfilled' ? results[4].value : null;
  const testimonials = results[5].status === 'fulfilled' ? results[5].value : null;
  const blogs = results[6].status === 'fulfilled' ? results[6].value : null;

  const registrations = regs?.data || [];
  const contactItems = contacts?.data || [];

  return {
    totalCourses: courses?.total || courses?.data?.length || 0,
    totalClasses: classes?.total || classes?.data?.length || 0,
    totalRegistrations: registrations.length,
    newContacts: contactItems.filter((c) => c.status === 'New').length,
    totalInstructors: instructors?.data?.length || 0,
    totalTestimonials: testimonials?.data?.length || 0,
    totalBlogs: blogs?.data?.length || 0,
    recentRegistrations: registrations.slice(0, 5),
    registrationsByStatus: registrations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {}),
  };
};
