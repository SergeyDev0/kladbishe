'use client';

import styles from "./page.module.scss";
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Pagination from './components/Pagination';
import Link from "next/link";

// Типы данных
interface BurialRecord {
  id: number;
  name: string;
  birthYear: number;
  deathYear: number;
  location: string;
  imageUrl: string;
}

// Моковые данные для демонстрации
const mockData: BurialRecord[] = [
  {
    id: 1,
    name: "Иванов Иван Иванович",
    birthYear: 1920,
    deathYear: 2025,
    location: "Кладбище 'Высокий'",
    imageUrl: "/1.jpg"
  },
  {
    id: 2,
    name: "Петров Петр Петрович",
    birthYear: 1930,
    deathYear: 2020,
    location: "Кладбище 'Высокий'",
    imageUrl: "/1.jpg"
  },
  {
    id: 3,
    name: "Сидоров Сидор Сидорович",
    birthYear: 1940,
    deathYear: 2015,
    location: "Кладбище 'Высокий'",
    imageUrl: "/1.jpg"
  },
  {
    id: 4,
    name: "Козлов Козел Козлович",
    birthYear: 1950,
    deathYear: 2010,
    location: "Кладбище 'Высокий'",
    imageUrl: "/1.jpg"
  },
  {
    id: 5,
    name: "Волков Волк Волкович",
    birthYear: 1960,
    deathYear: 2005,
    location: "Кладбище 'Высокий'",
    imageUrl: "/1.jpg"
  },
  {
    id: 6,
    name: "Медведев Медведь Медведевич",
    birthYear: 1970,
    deathYear: 2000,
    location: "Кладбище 'Высокий'",
    imageUrl: "/1.jpg"
  }
];

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
 
	
  const [searchQuery, setSearchQuery] = useState({
    surname: '',
    name: '',
    patronymic: '',
    birthYear: '',
    deathYear: '',
    location: 'default'
  });

  const [searchResults, setSearchResults] = useState<BurialRecord[]>([]);
	const [modeForm, setModeForm] = useState<"find" | "add" | "file">("find");

  const itemsPerPage = 3;
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  const filteredResults = useMemo(() => {
    if (!searchQuery.surname && !searchQuery.name && !searchQuery.patronymic && 
        !searchQuery.birthYear && !searchQuery.deathYear && searchQuery.location === 'default') {
      return mockData;
    }

    return mockData.filter(record => {
      const matchesSurname = !searchQuery.surname || 
        record.name.toLowerCase().includes(searchQuery.surname.toLowerCase());
      const matchesName = !searchQuery.name || 
        record.name.toLowerCase().includes(searchQuery.name.toLowerCase());
      const matchesPatronymic = !searchQuery.patronymic || 
        record.name.toLowerCase().includes(searchQuery.patronymic.toLowerCase());
      const matchesBirthYear = !searchQuery.birthYear || 
        record.birthYear.toString().includes(searchQuery.birthYear);
      const matchesDeathYear = !searchQuery.deathYear || 
        record.deathYear.toString().includes(searchQuery.deathYear);
      const matchesLocation = searchQuery.location === 'default' || 
        record.location.includes(searchQuery.location);

      return matchesSurname && matchesName && matchesPatronymic && 
             matchesBirthYear && matchesDeathYear && matchesLocation;
    });
  }, [searchQuery]);

  // Пагинированные результаты
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, currentPage]);

  // Обновление URL при изменении страницы
  useEffect(() => {
    if (currentPage > 1 && filteredResults.length <= (currentPage - 1) * itemsPerPage) {
      const maxPage = Math.ceil(filteredResults.length / itemsPerPage);
      if (maxPage > 0) {
        router.push(`?page=${maxPage}`);
      }
    }
  }, [currentPage, filteredResults.length, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentPage !== 1) {
      router.push('?page=1');
    }
    
    setTimeout(() => {
    }, 500);
  };

  const handleInputChange = (field: keyof typeof searchQuery, value: string) => {
    setSearchQuery(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setSearchQuery({
      surname: '',
      name: '',
      patronymic: '',
      birthYear: '',
      deathYear: '',
      location: 'default'
    });
    router.push('?page=1');
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
					<form className={styles.form} onSubmit={handleSearch}>
						<nav className={styles.nav}>
							<ul>
								<li>
									<Link href="/">Главная</Link>
								</li>
								<li>
									<Link href="/">Магазины</Link>
								</li>
								<li>
									<Link href="/">Услуги</Link>
								</li>
								<li>
									<Link href="/">О нас</Link>
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
								<input className={styles.file} type="file" id="file" />
								<label className={styles.fileButton} htmlFor="file">
									<Image src="/download.svg" alt="Иконка" width={24} height={24} />
									Загрузить файл
								</label>
								<button className={styles.manual} onClick={() => setModeForm("add")}>Ввести вручную</button>
							</div>
						) : (
							<>
								<div className={styles.formBody}>
									<div className={styles.inputWrapper}>
										<input 
											className={styles.input} 
											type="text" 
											placeholder="Искомая фамилия" 
											value={searchQuery.surname}
											onChange={(e) => handleInputChange('surname', e.target.value)}
										/>
										<span className={styles.required}>*</span>
									</div>
									<div className={styles.inputWrapper}>
										<input 
											className={styles.input} 
											type="text" 
											placeholder="Имя" 
											value={searchQuery.name}
											onChange={(e) => handleInputChange('name', e.target.value)}
										/>
									</div>
									<div className={styles.inputWrapper}>
										<input 
											className={styles.input} 
											type="text" 
											placeholder="Отчество" 
											value={searchQuery.patronymic}
											onChange={(e) => handleInputChange('patronymic', e.target.value)}
										/>
									</div>
									<div className={styles.double}>
										<div className={styles.inputWrapper}>
											<input 
													className={styles.input} 
													type="text" 
													placeholder="Год рождения" 
													value={searchQuery.birthYear}
													onChange={(e) => handleInputChange('birthYear', e.target.value)}
												/>
										</div>
										<div className={styles.inputWrapper}>
											<input 
												className={styles.input} 
												type="text" 
												placeholder="Год смерти" 
												value={searchQuery.deathYear}
												onChange={(e) => handleInputChange('deathYear', e.target.value)}
											/>
										</div>
									</div>
									<div className={styles.inputWrapper}>
										<select 
											className={styles.input} 
											value={searchQuery.location}
											onChange={(e) => handleInputChange('location', e.target.value)}
										>
											<option value="default" disabled>Расположение</option>
											<option value="Кладбище 'Высокий'">Кладбище "Высокий"</option>
										</select>
									</div>
									<div className={styles.formActions}>
										<button type="submit" className={styles.submit}>
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
									<button className={styles.manual} onClick={() => setModeForm("file")}>Распознать текст по изображению</button>
								)}
							</>
						)}
					</form>
				</div>
				<section className={styles.results}>
					<h2>Результаты поиска: {filteredResults.length}</h2>
					
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
											src={record.imageUrl} 
											alt="tombstone" 
											width={400} 
											height={400} 
											className={styles.img}
										/>
										<h3 className={styles.name}>{record.name}</h3>
										<h4 className={styles.info}>Годы жизни: <span>{record.birthYear} - {record.deathYear}</span></h4>
										<h4 className={styles.info}>Место захоронения: <span>{record.location}</span></h4>
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
      </main>
			<footer className={styles.footer}>
				<div className={styles.footerWrapper}>
					<div className={styles.row}>
						<div className={styles.col}>
							<h3>Контакты</h3>
							<ul className={styles.list}>
								<li>
									<a href="tel:79999999999">+7 (999) 999-99-99</a>
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
						<h4>©2025 | ИП Саунин Д. А. </h4>
						<p>Защищено авторским правом</p>
					</div>
				</div>
			</footer>
    </div>
  );
}
