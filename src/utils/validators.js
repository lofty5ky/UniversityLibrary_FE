export const validateName = (name) => {
  if (name.trim().length < 5) {
    return "Tên thể loại phải có ít nhất 5 ký tự.";
  }
  if (/\d/.test(name)) {
    return "Tên thể loại không được chứa chữ số.";
  }
  return "";
};

export const validateDescription = (description) => {
  if (description.trim().length < 25) {
    return "Mô tả phải có ít nhất 25 ký tự.";
  }
  return "";
};

export const validateCategory = (category) => {
  const errors = {
    name: validateName(category.name),
    description: validateDescription(category.description),
  };

  const isValid = !errors.name && !errors.description;
  return { isValid, errors };
};

export const validatePublisherName = (name) => {
  if (name.trim().length < 10) {
    return "Tên nhà xuất bản phải có ít nhất 10 ký tự.";
  }
  return "";
};

export const validatePublisherAddress = (address) => {
  if (address.trim().length < 10) {
    return "Địa chỉ phải có ít nhất 10 ký tự.";
  }
  return "";
};

export const validatePublisherContactInfo = (contactInfo) => {
  if (!/^\d{10}$/.test(contactInfo)) {
    return "Số điện thoại phải đủ 10 chữ số và chỉ chứa số.";
  }
  return "";
};

export const validatePublisher = (publisher) => {
  const errors = {
    name: validatePublisherName(publisher.name),
    address: validatePublisherAddress(publisher.address),
    contact_info: validatePublisherContactInfo(publisher.contact_info),
  };

  const isValid = !errors.name && !errors.address && !errors.contact_info;
  return { isValid, errors };
};

export const validateAuthorName = (name) => {
  if (name.trim().length < 8) {
    return "Tên tác giả phải có ít nhất 8 ký tự.";
  }
  return "";
};

export const validateAuthorBiography = (biography) => {
  if (biography.trim().length < 20) {
    return "Tiểu sử phải có ít nhất 20 ký tự.";
  }
  return "";
};

export const validateAuthorDob = (birth_date) => {
  if (!birth_date) {
    return "Ngày sinh không được để trống.";
  }

  const year = new Date(birth_date).getFullYear();
  const currentYear = new Date().getFullYear();

  if (year > currentYear) {
    return "Ngày sinh không được lớn hơn năm hiện tại.";
  }
  if (year < 1800) {
    return "Ngày sinh không được nhỏ hơn năm 1800.";
  }
  return "";
};

export const validateAuthor = (author) => {
  const errors = {
    name: validateAuthorName(author.name),
    biography: validateAuthorBiography(author.biography),
    birth_date: validateAuthorDob(author.birth_date),
  };

  const isValid = !errors.name && !errors.biography && !errors.birth_date;
  return { isValid, errors };
};
