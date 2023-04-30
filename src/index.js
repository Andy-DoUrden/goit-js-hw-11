import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  input: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const { input, gallery, loadMoreBtn } = refs;

const BASE_URL = 'https://pixabay.com/api/';

let page = 1;

let inputValue = '';

input.addEventListener('submit', onSubmit);

loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

var lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

async function onSubmit(e) {
  e.preventDefault();

  inputValue = '';
  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hide');

  const { searchQuery } = e.currentTarget;

  inputValue = searchQuery.value;

  try {
    const fetchData = await fetchImages(inputValue);

    const images = await fetchData.data.hits;

    gallery.innerHTML = createGallery(images);

    loadMoreBtn.classList.remove('is-hide');

    lightbox.refresh();

    autoScroll();
  } catch {
    loadMoreBtn.classList.add('is-hide');

    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

async function onLoadMoreBtnClick() {
  page += 1;

  try {
    const fetchData = await fetchImages(inputValue);

    const images = await fetchData.data.hits;

    gallery.insertAdjacentHTML('beforeend', createGallery(images));

    lightbox.refresh();

    autoScroll();
  } catch {
    loadMoreBtn.classList.add('is-hide');

    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function fetchImages(inputValue) {
  const searchParams = new URLSearchParams({
    key: '35900010-e6fba30fbbb71a29105fd08a0',
    q: inputValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 40,
  });

  return axios.get(`${BASE_URL}?${searchParams}`);
}

function createGallery(images) {
  return (html = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <a class="photo-card" href=${largeImageURL}>
          <img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item">
              <b>Likes</b>${likes}
            </p>
            <p class="info-item">
              <b>Views</b>${views}
            </p>
            <p class="info-item">
              <b>Comments</b>${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>${downloads}
            </p>
          </div>
        </a>
        `;
      }
    )
    .join(''));
}

function autoScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
