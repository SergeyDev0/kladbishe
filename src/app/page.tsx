'use client';

import styles from "./page.module.scss";
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import Pagination from './components/Pagination';
import Link from "next/link";
import { HomeIcon, Info, Scroll, ShoppingCartIcon } from "lucide-react";

interface BurialRecord {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  deathDate: string;
  latitudeText: string;
  longitudeText: string;
  locationText: string;
  rawText: string | null;
  gravePolygon: any | null;
  imagePath: string;
  createdAt: string;
}


export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
 
  const [searchQuery, setSearchQuery] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    birthYear: '',
    deathYear: '',
    imageUrl: '',
    latitudeText: '',
    longitudeText: '',
    locationText: '',
  });
 	const [ocr, setOcr] = useState<object>({});
	
	const [addForm, setAddForm] = useState({
		firstName: '',
		lastName: '',
		middleName: '',
		birthYear: '',
		deathYear: '',
		imageFile: null as File | string | null,
		imageUrl: '',
		latitudeText: '',
		longitudeText: '',
		locationText: ''
	});


  const [searchResults, setSearchResults] = useState<BurialRecord[]>([]);
	const [modeForm, setModeForm] = useState<"find" | "add" | "file">("find");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldPrefillAdd, setShouldPrefillAdd] = useState(false);
  const [selectedMemoryImage, setSelectedMemoryImage] = useState<string | null>(null);
  const [fileForAdd, setFileForAdd] = useState<File | null>(null);
	const [isDisabledButton, setIsDisabledButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 6;
  const currentPage = parseInt(searchParams.get('page') || '1');

  
  const filteredResults = useMemo(() => {
    return searchResults;
  }, [searchResults]);

  // Пагинированные результаты
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, currentPage]);

  useEffect(() => {
    if (currentPage > 1 && filteredResults.length > 0 && filteredResults.length <= (currentPage - 1) * itemsPerPage) {
      const maxPage = Math.ceil(filteredResults.length / itemsPerPage);
      if (maxPage > 0) {
        router.push(`?page=${maxPage}`);
      }
    }
  }, [currentPage, filteredResults.length, router]);

  // Сбрасываем значения при переключении между формами и управляем показом результатов
  useEffect(() => {
    if (modeForm === 'find') {
      setSearchQuery({
        firstName: '',
        lastName: '',
        middleName: '',
        birthYear: '',
        deathYear: '',
        imageUrl: '',
        latitudeText: '',
        longitudeText: '',
        locationText: '',
      });
      setHasSearched(false);
      setSearchResults([]);
    }

    if (modeForm === 'add') {
      if (shouldPrefillAdd) {
        setShouldPrefillAdd(false);
      }
    }

    if (modeForm === 'file') {
      if (!shouldPrefillAdd) {
        setSelectedFile(null);
      } else if (fileForAdd) {
        setSelectedFile(fileForAdd);
      }
    }
  }, [modeForm, shouldPrefillAdd, fileForAdd]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Поиск:', searchQuery);
    
    // Проверяем, что фамилия заполнена
    if (!searchQuery.lastName.trim()) {
      alert('Пожалуйста, заполните фамилию');
      return;
    }
    
    console.log('Отправляем запрос на сервер...');
    
    try {
      const requestData = {
        firstName: searchQuery.firstName,
        lastName: searchQuery.lastName,
        middleName: searchQuery.middleName,
        birthYear: searchQuery.birthYear,
        deathYear: searchQuery.deathYear,
        locationText: searchQuery.locationText,
      };
      
      console.log('Данные запроса:', requestData);
      
      const response = await fetch('http://localhost:3000/getData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка сервера:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Результат поиска:', result);
      
      // Сохраняем результаты поиска (сервер возвращает массив напрямую)
      setSearchResults(Array.isArray(result) ? result : []);
      console.log('Результаты сохранены в состояние');
      setHasSearched(true);
      
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Произошла ошибка при поиске: ${errorMessage}`);
      setHasSearched(false);
      setSearchResults([]);
    }
    
    if (currentPage !== 1) {
      router.push('?page=1');
    }
    
  };

  // Обработчик отправки формы добавления
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(addForm);
    
    // Проверяем, что все поля заполнены
    if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.middleName.trim() || 
        !addForm.birthYear.trim() || !addForm.deathYear.trim() || !addForm.locationText.trim() || !addForm.imageFile) {
      alert('Пожалуйста, заполните все поля');
      return;
    } else {
			setIsDisabledButton(true);
		}
    
    try {
      const formData = new FormData();
      
      // Добавляем текстовые данные
      formData.append('firstName', addForm.firstName);
      formData.append('lastName', addForm.lastName);
      formData.append('middleName', addForm.middleName);
      formData.append('birthYear', addForm.birthYear);
      formData.append('deathYear', addForm.deathYear);
      formData.append('latitudeText', addForm.latitudeText);
      formData.append('longitudeText', addForm.longitudeText);
      formData.append('locationText', addForm.locationText);
      
      // Добавляем файл изображения как imageFile
      if (addForm.imageFile instanceof File) {
        formData.append('imageFile', addForm.imageFile);
      } else if (typeof addForm.imageFile === 'string') {
        formData.append('imageUrl', addForm.imageFile);
      }

      const response = await fetch('http://localhost:3000/saveData', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Данные успешно сохранены');
      alert('Запись успешно добавлена!');
      
      // Сбрасываем форму
      setAddForm({
        firstName: '',
        lastName: '',
        middleName: '',
        birthYear: '',
        deathYear: '',
        imageFile: null,
        imageUrl: '',
        latitudeText: '',
        longitudeText: '',
        locationText: '',
      });
      setSelectedFile(null);
      setFileForAdd(null);
      
      // Сбрасываем input файла через ref
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Произошла ошибка при сохранении данных: ${errorMessage}`);
    } finally {
      setIsDisabledButton(false);
    }
  };

  const handleInputChange = (field: keyof typeof searchQuery, value: string) => {
    setSearchQuery(prev => ({ ...prev, [field]: value }));
  };

  // Обработчик изменения полей формы добавления
  const handleAddFormChange = (field: keyof typeof addForm, value: string | File | null) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
    setSearchQuery({
      firstName: '',
      lastName: '',
      middleName: '',
      birthYear: '',
      deathYear: '',
      imageUrl: '',
      latitudeText: '',
      longitudeText: '',
      locationText: '',
    });
    setHasSearched(false);
    setSearchResults([]);
		setFileForAdd(null);
		setSelectedFile(null);
		setAddForm({
			firstName: '',
			lastName: '',
			middleName: '',
			birthYear: '',
			deathYear: '',
			imageFile: null,
			imageUrl: '',
			latitudeText: '',
			longitudeText: '',
			locationText: '',
		});
    router.push('?page=1', { scroll: false });
  };

  const uploadImage = async (file: File): Promise<object> => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3000/crop-ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Результат обработки:', result);
      
      // Заполняем форму данными из OCR
      if (result.firstName) {
        const ocrData = {
          firstName: result.firstName || '',
          lastName: result.lastName || '',
          middleName: result.middleName || '',
          birthYear: result.birthYear ? result.birthYear.split('.')[2] : '',
          deathYear: result.deathYear ? result.deathYear.split('.')[2] : '',
          imageFile: result.imageUrl || '', // Сохраняем imageUrl как строку
          imageUrl: result.imageUrl || '',
          latitudeText: result.locationText ? result.locationText.match(/Широта:\s*([\d.]+)/)?.[1] || '' : '',
          longitudeText: result.locationText ? result.locationText.match(/Долгота:\s*([\d.]+)/)?.[1] || '' : '',
          locationText: ''
        };
        
        setSearchQuery({
          firstName: ocrData.firstName,
          lastName: ocrData.lastName,
          middleName: ocrData.middleName,
          birthYear: ocrData.birthYear,
          deathYear: ocrData.deathYear,
          imageUrl: '',
          latitudeText: ocrData.latitudeText,
          longitudeText: ocrData.longitudeText,
          locationText: ''
        });
        
        setAddForm(ocrData);
      }
      
      setShouldPrefillAdd(true);
      setFileForAdd(file);
      setModeForm("add");
      setOcr(result.ocr);
      setSelectedFile(file);

      return result;
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
			setSelectedFile(null);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

	const handleAdd = async () => {
		try {
			const formData = new FormData();
			
			// Добавляем текстовые данные
			formData.append('firstName', addForm.firstName);
			formData.append('lastName', addForm.lastName);
			formData.append('middleName', addForm.middleName);
			formData.append('birthYear', addForm.birthYear);
			formData.append('deathYear', addForm.deathYear);
			formData.append('latitudeText', addForm.latitudeText);
			formData.append('longitudeText', addForm.longitudeText);
			formData.append('locationText', addForm.locationText);
			
			// Добавляем файл изображения как imageFile, если есть
			if (addForm.imageFile) {
				formData.append('imageFile', addForm.imageFile);
			}

			const response = await fetch('http://localhost:3000/saveData', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log('Результат добавления:', result);
			
			// Сбрасываем форму после успешного добавления
			setAddForm({
				firstName: '',
				lastName: '',
				middleName: '',
				birthYear: '',
				deathYear: '',
				imageFile: null,
				imageUrl: '',
				latitudeText: '',
				longitudeText: '',
				locationText: ''
			});
			
			// Переключаемся на режим поиска
			setModeForm("find");

			return result;
		} catch (error) {
			console.error('Ошибка при добавлении записи:', error);
			alert('Произошла ошибка при добавлении записи. Попробуйте еще раз.');
			throw error;
		}
	}

  // Обработчик изменения файла для OCR
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения (.jpg, .png)');
        return;
      }
      
      setSelectedFile(file);
      
      // Автоматически отправляем файл на сервер для OCR
      uploadImage(file);
    }
  };

  // Обработчик изменения файла для формы добавления
  const handleAddFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения (.jpg, .png)');
        return;
      }
      
      setFileForAdd(file);
      setAddForm(prev => ({ ...prev, imageFile: file }));
      
      // Отправляем файл на /crop для получения imageUrl
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:3000/crop', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Результат crop:', result);
        
        // Сохраняем imageUrl в состояние формы
        setAddForm(prev => ({ ...prev, imageUrl: result.imageUrl || '' }));
        
      } catch (error) {
        console.error('Ошибка при обработке изображения:', error);
        alert('Ошибка при обработке изображения. Попробуйте еще раз.');
      }
    }
  };


  return (
    <div className={styles.page}>
      <main className={styles.main}>
      	<div className={styles.background}>
					<div className={styles.info}>
						<h1>Общедоступная база захоронений</h1>
						<div className={styles.line}></div>
						<p>Социальный проект по поиску захоронений <br /> и уходу за ними</p>
					</div>
					<form className={styles.form} onSubmit={modeForm === "add" ? handleAddSubmit : handleSearch}>
						<nav className={styles.nav}>
							<ul>
								<li>
									<Link href="/"><HomeIcon /> Главная</Link>
								</li>
								<li>
									<Link href="/"><ShoppingCartIcon /> Магазины</Link>
								</li>
								<li>
									<Link href="/"><Scroll /> Услуги</Link>
								</li>
								<li>
									<Link href="/"><Info /> О нас</Link>
								</li>
							</ul>
						</nav>
						<div className={styles.formHeader}>
							<h2>Найдите или добавьте захороненного</h2>
							{modeForm === "find" ? (
								<button type="button" onClick={() => setModeForm("file")}>
									<Image src="/add.svg" alt="" width={24} height={20} />
									Добавить захороненного
								</button>
							) : (
								<button type="button" onClick={() => setModeForm("find")}>
									<Image src="/search.svg" alt="Иконка" width={16} height={16} />
									Найти захороненного
								</button>
							)}
						</div>
						{modeForm === "file" ? (
							<div className={styles.formBodyFile}>
								<h4>Загрузите фотографию с надгробием</h4>
								<p>*текст должен быть хорошо читаемым</p>
								<input 
									className={styles.file} 
									type="file" 
									id="file" 
									accept=".jpg,.jpeg,.png"
									onChange={handleFileChange}
									disabled={isUploading}
								/>
								<label className={styles.fileButton} htmlFor="file">
									<Image src="/download.svg" alt="Иконка" width={24} height={24} />
									{isUploading ? 'Загрузка...' : 'Загрузить файл'}
								</label>
								{selectedFile && (
									<p className={styles.fileInfo}>
										Выбран файл: {selectedFile.name}
									</p>
								)}
								<button type="button" className={styles.manual} onClick={() => setModeForm("add")}>Ввести вручную</button>
							</div>
						) : (
							<>
								<div className={styles.formBody}>
									<div className={styles.inputWrapper}>
										<input 
											className={styles.input} 
											type="text" 
											placeholder="Искомая фамилия" 
											value={modeForm === "add" ? addForm.lastName : searchQuery.lastName}
											onChange={(e) => modeForm === "add" ? handleAddFormChange('lastName', e.target.value) : handleInputChange('lastName', e.target.value)}
										/>
										<span className={styles.required}>*</span>
									</div>
									<div className={styles.inputWrapper}>
										<input 
											className={styles.input} 
											type="text" 
											placeholder="Имя" 
											value={modeForm === "add" ? addForm.firstName : searchQuery.firstName}
											onChange={(e) => modeForm === "add" ? handleAddFormChange('firstName', e.target.value) : handleInputChange('firstName', e.target.value)}
										/>
										{modeForm === "add" && <span className={styles.required}>*</span>}
									</div>
									<div className={styles.inputWrapper}>
										<input 
											className={styles.input} 
											type="text" 
											placeholder="Отчество" 
											value={modeForm === "add" ? addForm.middleName : searchQuery.middleName}
											onChange={(e) => modeForm === "add" ? handleAddFormChange('middleName', e.target.value) : handleInputChange('middleName', e.target.value)}
										/>
										{modeForm === "add" && <span className={styles.required}>*</span>}
									</div>
									<div className={styles.double}>
										<div className={styles.inputWrapper}>
											<input 
													className={styles.input} 
													type="text" 
													placeholder="Год рождения" 
													value={modeForm === "add" ? addForm.birthYear : searchQuery.birthYear}
													onChange={(e) => modeForm === "add" ? handleAddFormChange('birthYear', e.target.value) : handleInputChange('birthYear', e.target.value)}
												/>
											{modeForm === "add" && <span className={styles.required}>*</span>}
										</div>
										<div className={styles.inputWrapper}>
											<input 
												className={styles.input} 
												type="text" 
												placeholder="Год смерти" 
												value={modeForm === "add" ? addForm.deathYear : searchQuery.deathYear}
												onChange={(e) => modeForm === "add" ? handleAddFormChange('deathYear', e.target.value) : handleInputChange('deathYear', e.target.value)}
											/>
											{modeForm === "add" && <span className={styles.required}>*</span>}
										</div>
									</div>
									<div className={styles.inputWrapper}>
										<select 
											className={styles.input} 
											value={modeForm === "add" ? addForm.locationText : searchQuery.locationText}
											onChange={(e) => modeForm === "add" ? handleAddFormChange('locationText', e.target.value) : handleInputChange('locationText', e.target.value)}
										>
											<option value="" disabled>Расположение</option>
											<option value="">Любое</option>
											<option value="Кладбище 'Высокий'">Кладбище "Высокий"</option>
										</select>
										{modeForm === "add" && <span className={styles.required}>*</span>}
									</div>
									<div className={styles.formActions}>
										<button type="submit" className={styles.submit} disabled={isDisabledButton}>
											{modeForm === "find" ? (
												<>
													<Image src="/search-w.svg" alt="Иконка" width={16} height={16} />
													Найти
												</>
											) : (
												<>
													<Image src="/add-w.svg" alt="Иконка" width={24} height={20} />
													Добавить
												</>
											)}
										</button>
										<button type="button" onClick={handleReset} className={styles.reset}>
											Сбросить
										</button>
									</div>
								</div>
								{modeForm === "add" && (
									<div className={styles.fileRow}>
										<div className={styles.fileInput}>
											<input 
												ref={fileInputRef}
												type="file" 
												id="addFile" 
												accept=".jpg,.jpeg,.png"
												onChange={handleAddFileChange}
												disabled={isUploading}
											/>
											<label htmlFor="addFile">
												<Image src="/download.svg" alt="Иконка" width={24} height={24} />
												{isUploading ? 'Загрузка...' : 'Загрузить изображение'}
											</label>
											{fileForAdd && (
												<p className={styles.fileInfo}>
													Выбран файл: {fileForAdd.name}
												</p>
											)}
										</div>
								<button type="button" className={styles.manual} onClick={() => setModeForm("file")}>
									Распознать текст
								</button>
									</div>
								)}
							</>
						)}
					</form>
				</div>
				{modeForm === "find" && hasSearched && (
					<section className={styles.results}>
						<h2 id="resultsTitle">Результаты поиска: {filteredResults.length}</h2>
						
						{filteredResults.length === 0 ? (
							<div className={styles.noResults}>
								<p>По вашему запросу ничего не найдено</p>
							</div>
						) : (
							<>
								<div className={styles.grid}>
									{paginatedResults.map((record) => (
										<div key={record.id} className={styles.card}>
											<Image 
												src={`http://localhost:3000${record.imagePath}`} 
												alt="tombstone" 
												width={400} 
												height={400} 
												className={styles.img}
												onClick={() => setSelectedMemoryImage(`http://localhost:3000${record.imagePath}`)}
											/>
											<h3 className={styles.name}>
												{record.lastName} {record.firstName} {record.middleName}
											</h3>
											<h4 className={styles.info}>Годы жизни: <span>{record.birthDate} - {record.deathDate}</span></h4>
											<h4 className={styles.info}>Место захоронения: <span>{record.locationText || 'Не указано'}</span></h4>
											{record.latitudeText && record.longitudeText && (
												<h4 className={styles.info}>Координаты: <span>{record.latitudeText}, {record.longitudeText}</span></h4>
											)}
											<button className={styles.button}>Посмотреть расположение</button>
										</div>
									))}
								</div>
								
								<Pagination
									totalItems={filteredResults.length}
									itemsPerPage={itemsPerPage}
									currentPage={currentPage}
									maxVisiblePages={5}
								/>
							</>
						)}
					</section>
				)}
      </main>
			
			<section className={styles.memoryWall}>
				<div className={styles.memoryWallContainer}>
					<h2 className={styles.memoryWallTitle}>Стена памяти</h2>
					<p className={styles.memoryWallSubtitle}>Фотографии захоронений из нашей базы</p>
					<div className={styles.memoryGrid}>
						{Array.from({ length: 52 }, (_, i) => i + 1).map((num) => (
							<div key={num} className={styles.memoryItem} onClick={() => setSelectedMemoryImage(`/img/2025-08-27 15-31-30 (${num}).jpeg`)}>
								<Image 
									src={`/img/2025-08-27 15-31-30 (${num}).jpeg`}
									alt={`Захоронение ${num}`}
									width={300}
									height={400}
									className={styles.memoryImage}
								/>
							</div>
						))}
					</div>
				</div>
			</section>
			
			{selectedMemoryImage && (
				<div className={styles.imageModal} onClick={() => setSelectedMemoryImage(null)}>
					<div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
						<button 
							className={styles.imageModalClose}
							onClick={() => setSelectedMemoryImage(null)}
							aria-label="Закрыть"
						>
							×
						</button>
						<Image 
							src={selectedMemoryImage}
							alt="Увеличенное изображение"
							width={800}
							height={1000}
							className={styles.imageModalImage}
						/>
					</div>
				</div>
			)}
			
			<footer className={styles.footer}>
				<div className={styles.footerWrapper}>
					<div className={styles.row}>
						<div className={styles.col}>
							<h3>Контакты</h3>
							<ul className={styles.list}>
								<li>
									<a href="tel:79051263337">+7 (905) 126-33-37</a>
								</li>
								<li>
									<a href="mailto:exapmle@gmail.com">exapmle@gmail.com</a>
								</li>
							</ul>
						</div>
						<div className={styles.col}>
							<h3>Документы</h3>
							<ul className={styles.list}>
								<li>
									<a href="/">Политика конфиденциальности</a>
								</li>
								<li>
									<a href="/">Пользовательское соглашение</a>
								</li>
							</ul>
						</div>
					</div>
					<div className={styles.copyright}>
						{/* <h4>©2025 | ИП Саунин Д. А. </h4> */}
						<p>Защищено авторским правом</p>
					</div>
				</div>
			</footer>
    </div>
  );
}
