'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import styles from './Pagination.module.scss';
import Image from 'next/image';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  maxVisiblePages?: number;
}

export default function Pagination({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  maxVisiblePages = 5 
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Если страниц меньше или равно 1, не показываем пагинацию
  if (totalPages <= 1) {
    return null;
  }

  const createPageURL = useCallback((pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  }, [searchParams]);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      router.push(createPageURL(pageNumber));
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Генерируем массив страниц для отображения
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // Если общее количество страниц меньше максимального видимого, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Иначе показываем с многоточием
      if (currentPage <= 3) {
        // В начале
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // В конце
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // В середине
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={styles.pagination}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`${styles.pageButton} ${styles.prevButton} ${currentPage === 1 ? styles.disabled : ''}`}
        aria-label="Предыдущая страница"
      >
        <Image src="/arrow-left.svg" alt='Назад' width={22} height={16} />
      </button>
      
      {visiblePages.map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className={styles.ellipsis}>...</span>
          ) : (
            <button
              onClick={() => handlePageChange(page as number)}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              aria-label={`Страница ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )}
        </div>
      ))}
      
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`${styles.pageButton} ${styles.nextButton} ${currentPage === totalPages ? styles.disabled : ''}`}
        aria-label="Следующая страница"
      >
        <Image src="/arrow-left.svg" alt='Назад' width={22} height={16} />
      </button>
    </div>
  );
}

