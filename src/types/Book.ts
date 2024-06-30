export interface OpenLibraryResponse {
    docs: Book[];
    numFound: number;
    start: number;
  }
  
  export interface Book {
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    isbn?: string[];
    number_of_pages_median?: number;
  }
  