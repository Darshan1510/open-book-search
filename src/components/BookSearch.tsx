import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Pagination, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { Book, OpenLibraryResponse } from "../types/Book";

const BookSearch: React.FC = () => {
  const [bookName, setBookName] = useState<string>("");
  const [results, setResults] = useState<Book[]>([]);
  const [sortByYear, setSortByYear] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [showBookCovers, setShowBookCovers] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("title") || "";
    const sort = params.get("sort") === "old";
    const page = parseInt(params.get("page") || "1", 10);

    setBookName(query);
    setSortByYear(sort);
    setCurrentPage(page);

    if (query.length > 2) {
      const offset = (page - 1) * 100; // Calculate offset based on page number and limit
      fetchBooks(query, sort, offset);
    }
  }, [location.search]);

  const fetchBooks = async (query: string, sortByYear: boolean, offset: number) => {
    try {
      let queryParams = new URLSearchParams();
      queryParams.append("title", query);
      queryParams.append("offset", offset.toString());
      queryParams.append("limit", "25");
      if (sortByYear) {
        queryParams.append("sort", "old");
      }
      const response = await axios.get<OpenLibraryResponse>(
        `https://openlibrary.org/search.json?${queryParams.toString()}`
      );
      setResults(response.data.docs);
      setTotalResults(response.data.numFound);
    } catch (error) {
      console.error("Error fetching book data:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setBookName(query);
    updateURL(query, sortByYear, 1);
  };

  const updateURL = (query: string, sortByYear: boolean, page: number) => {
    const sortParam = sortByYear ? "old" : "relevance";
    navigate(`/?title=${query}&sort=${sortParam}&page=${page}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(bookName, sortByYear, page);
  };

  const handleSortToggle = () => {
    const newSortByYear = !sortByYear;
    setSortByYear(newSortByYear);
    updateURL(bookName, newSortByYear, 1);
  };

  const renderPaginationItems = () => {
    const totalPages = Math.ceil(totalResults / 100);
    const visiblePages = 5; // Number of page links to display

    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    return pages;
  };

  return (
    <Container className="p-2">
      <Form>
        <Form.Group controlId="formBookName">
          <Form.Label>Search by Book Name/Title</Form.Label>
          <Form.Control
            type="text"
            value={bookName}
            onChange={handleInputChange}
            placeholder="Enter book name"
          />
        </Form.Group>
        <div className="d-flex gap-3">
          <Form.Check
            className="mt-1"
            type="switch"
            id="sort-switch"
            label={"Sort by Year"}
            checked={sortByYear}
            onChange={handleSortToggle}
          />
          <Form.Check
            className="mt-1 mr-2"
            type="switch"
            id="show-book-covers"
            label={"Show book covers"}
            checked={showBookCovers}
            onChange={() => setShowBookCovers(!showBookCovers)}
          />
        </div>
      </Form>
      <hr />
      <Row>
        <h5 className="text-center text-secondary">Results: {totalResults}</h5>
        {results.map((book, index) => (
          <Col md={4} key={index} className="mb-3">
            <Card className="h-100">
              {showBookCovers && book.cover_i && (
                <Card.Img
                  variant="top"
                  height="500"
                  width="100"
                  src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                />
              )}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <Card.Text>
                  <strong>Author(s):</strong> {book.author_name?.join(", ")}
                </Card.Text>
                <Card.Text>
                  <strong>First Published:</strong> {book.first_publish_year}
                </Card.Text>
                <Card.Text>
                  <strong>ISBN:</strong> {book.isbn ? book.isbn[0] : "N/A"}
                </Card.Text>
                <Card.Text>
                  <strong>Number of Pages:</strong> {book.number_of_pages_median}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {renderPaginationItems()}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(totalResults / 100)}
        />
      </Pagination>
    </Container>
  );
};

export default BookSearch;
