import {Category, Genre} from "./models";

export function getGenresFromCategory(genres: Genre[], category: Category) {
    return genres.filter(genre => {
        return genre.categories.filter(cat => cat.id === category.id).length !== 0;
    });
}

export function getCategoriesFromGenre(categories: Category[], genre: Genre) {
    return categories.filter(category => {
        return genre.categories.filter(cat => cat.id === category.id).length !== 0;
    });
}
