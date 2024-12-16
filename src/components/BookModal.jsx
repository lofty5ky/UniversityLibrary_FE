import { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Autocomplete,
} from "@mui/material";
import axios from "axios";

const BookModal = ({ open, onClose, bookId, onSave, onShowToast }) => {
  const [bookData, setBookData] = useState({
    title: "",
    summary: "",
    image: null,
    categoryId: null,
    authors: [],
    publicationYear: "",
    quantity: "",
  });
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCategories();
      await fetchAuthors();
      await fetchPublishers();
      if (bookId) {
        await fetchBookDetails(bookId);
      } else {
        resetForm();
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const resetForm = () => {
    setBookData({
      title: "",
      summary: "",
      image: null,
      categoryId: null,
      authors: [],
      publicationYear: "",
      quantity: "",
    });
    setSelectedAuthors([]);
    setSelectedPublisher(null);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/book-categories/public");
      setCategories(response.data);

      if (bookId) fetchBookDetails(bookId);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get("/api/authors", {
        params: { page: 0, size: 100 },
      });
      setAuthors(response.data.content);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await axios.get("/api/publishers", {
        params: { page: 0, size: 100 },
      });
      setPublishers(response.data.content);
    } catch (error) {
      console.error("Error fetching publishers:", error);
    }
  };

  const fetchBookDetails = async (id) => {
    try {
      const response = await axios.get(`/api/books/${id}`);
      const book = response.data;

      const matchedCategory = categories.find(
        (c) => c.name === book.category_name
      );

      const matchedPublisher = publishers.find(
        (p) => p.name === book.publisher_name
      );

      setBookData({
        title: book.title,
        summary: book.book_summary,
        categoryId: matchedCategory ? matchedCategory.id : null,
        image: book.image,
        authors: book.authors,
        publicationYear: book.publication_year,
        quantity: book.total_quantity,
      });

      setSelectedPublisher(
        matchedPublisher
          ? { id: matchedPublisher.publisherId, label: matchedPublisher.name }
          : null
      );

      const matchedAuthors = book.authors.map((authorName) => {
        const author = authors.find((a) => a.name === authorName);
        return author
          ? { label: author.name, id: author.authorId }
          : { label: authorName, id: null };
      });
      setSelectedAuthors(matchedAuthors);
    } catch (error) {
      console.error("Error fetching book details:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setBookData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    setBookData((prev) => ({ ...prev, image: file }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      console.log("Selected Authors:", selectedAuthors);
      const bookJson = {
        title: bookData.title,
        publisher_id: selectedPublisher?.id || null,
        category_id: bookData.categoryId,
        book_summary: bookData.summary,
        publication_year: bookData.publicationYear,
        total_quantity: bookData.quantity,
        author_ids: selectedAuthors.map((author) => author.id),
      };

      console.log(bookJson);

      formData.append("book", JSON.stringify(bookJson));

      if (bookData.image instanceof File) {
        formData.append("image", bookData.image);
      }

      if (bookId) {
        await axios.put(`/api/books/${bookId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onShowToast("Chỉnh sửa sách thành công!", "success");
      } else {
        await axios.post("/api/books", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onShowToast("Thêm sách mới thành công!", "success");
      }

      onSave();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving book:", error);
      onShowToast("Có lỗi xảy ra khi lưu sách!", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxHeight: "80vh",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          overflow: "auto",
        }}
      >
        <Typography variant="h6" mb={3}>
          {bookId ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Tựa đề sách"
            fullWidth
            value={bookData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
          <TextField
            label="Tóm tắt nội dung"
            multiline
            rows={5}
            fullWidth
            value={bookData.summary}
            onChange={(e) => handleInputChange("summary", e.target.value)}
          />
          <Button variant="outlined" component="label">
            {bookData.image ? "Thay đổi hình ảnh" : "Tải lên hình ảnh"}
            <input type="file" hidden onChange={handleImageChange} />
          </Button>

          {bookData.image && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              {typeof bookData.image === "string" ? (
                <img
                  src={`http://localhost:8080/api/images/${bookData.image}`}
                  alt="Hình ảnh sách"
                  style={{
                    maxWidth: "300px",
                    maxHeight: "300px",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                bookData.image instanceof File && (
                  <img
                    src={URL.createObjectURL(bookData.image)}
                    alt="Hình ảnh đã chọn"
                    style={{
                      maxWidth: "300px",
                      maxHeight: "300px",
                      borderRadius: "8px",
                    }}
                  />
                )
              )}
            </Box>
          )}
          <Autocomplete
            options={categories.map((category) => ({
              name: category.name,
              id: category.id,
            }))}
            value={
              categories.find(
                (category) => category.id === bookData.categoryId
              ) || null
            }
            onChange={(event, value) =>
              handleInputChange("categoryId", value.id || null)
            }
            renderInput={(params) => <TextField {...params} label="Thể loại" />}
            getOptionLabel={(option) => option.name || ""}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
          />

          <Autocomplete
            multiple
            options={authors
              .map((author) => ({
                label: author.name,
                id: author.authorId,
              }))
              .filter(
                (author) =>
                  !selectedAuthors.some(
                    (selectedAuthor) =>
                      selectedAuthor.id === author.authorId &&
                      selectedAuthor.label === author.label
                  )
              )}
            value={selectedAuthors}
            onChange={(event, value) => setSelectedAuthors(value)}
            renderInput={(params) => <TextField {...params} label="Tác giả" />}
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            filterSelectedOptions
          />

          <Autocomplete
            options={publishers.map((publisher) => ({
              label: publisher.name,
              id: publisher.publisherId,
            }))}
            value={selectedPublisher}
            onChange={(event, value) => setSelectedPublisher(value || null)}
            renderInput={(params) => (
              <TextField {...params} label="Nhà xuất bản" />
            )}
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
          />

          <TextField
            label="Năm xuất bản"
            fullWidth
            value={bookData.publicationYear}
            onChange={(e) =>
              handleInputChange("publicationYear", e.target.value)
            }
          />
          <TextField
            label="Số lượng"
            type="number"
            fullWidth
            value={bookData.quantity}
            onChange={(e) => handleInputChange("quantity", e.target.value)}
            disabled={!!bookId}
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
          <Button variant="outlined" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Lưu
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default BookModal;
