import {RouteProps} from "react-router-dom"
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/category/PageList";
import CategoryCreate from "../pages/category/PageForm";
import CastMemberList from "../pages/cast-member/PageList";
import CastMemberCreate from "../pages/cast-member/PageForm";
import GenresList from "../pages/genres/PageList";
import GenresCreate from "../pages/genres/PageForm";

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
        component: CategoryCreate,
        exact: true
    },
    {
        name: 'categories.edit',
        label: 'Editar categoria',
        path: '/categories/:id/edit',
        component: CategoryCreate,
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
        component: CastMemberCreate,
        exact: true
    },
    {
        name: 'cast-members.edit',
        label: 'Editar membro',
        path: '/cast-members/:id/edit',
        component: CastMemberCreate,
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
        component: GenresCreate,
        exact: true
    },
    {
        name: 'genres.edit',
        label: 'Editar gênero',
        path: '/genres/:id/edit',
        component: GenresCreate,
        exact: true
    },
];

export default routes;
