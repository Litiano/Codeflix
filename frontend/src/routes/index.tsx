import {RouteProps} from "react-router-dom"
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/category/PageList";
import CategoryForm from "../pages/category/PageForm";
import CastMemberList from "../pages/cast-member/PageList";
import CastMemberForm from "../pages/cast-member/PageForm";
import GenresList from "../pages/genres/PageList";
import GenresForm from "../pages/genres/PageForm";
import VideosList from "../pages/videos/PageList";
import VideosForm from "../pages/videos/PageForm";

export interface MyRouteProps extends RouteProps {
    name: string;
    label: string;
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    ///////////////////////////////////////
    {
        name: 'categories.list',
        label: 'Listar Categorias',
        path: '/categories',
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.create',
        label: 'Criar categoria',
        path: '/categories/create',
        component: CategoryForm,
        exact: true
    },
    {
        name: 'categories.edit',
        label: 'Editar categoria',
        path: '/categories/:id/edit',
        component: CategoryForm,
        exact: true
    },
    ////////////////////
    {
        name: 'cast-members.list',
        label: 'Listar Membros',
        path: '/cast-members',
        component: CastMemberList,
        exact: true
    },
    {
        name: 'cast-members.create',
        label: 'Criar membro',
        path: '/cast-members/create',
        component: CastMemberForm,
        exact: true
    },
    {
        name: 'cast-members.edit',
        label: 'Editar membro',
        path: '/cast-members/:id/edit',
        component: CastMemberForm,
        exact: true
    },
    ////////////////////////////////
    {
        name: 'genres.list',
        label: 'Listar Gêneros',
        path: '/genres',
        component: GenresList,
        exact: true
    },
    {
        name: 'genres.create',
        label: 'Criar gênero',
        path: '/genres/create',
        component: GenresForm,
        exact: true
    },
    {
        name: 'genres.edit',
        label: 'Editar gênero',
        path: '/genres/:id/edit',
        component: GenresForm,
        exact: true
    },
    ///////////////////////////////
    {
        name: 'videos.list',
        label: 'Listar Video',
        path: '/videos',
        component: VideosList,
        exact: true
    },
    {
        name: 'videos.create',
        label: 'Criar Video',
        path: '/videos/create',
        component: VideosForm,
        exact: true
    },
    {
        name: 'videos.edit',
        label: 'Editar Video',
        path: '/videos/:id/edit',
        component: VideosForm,
        exact: true
    },
];

export default routes;
