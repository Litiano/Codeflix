import {RouteProps} from "react-router-dom"
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/category/PageList";
import CastMemberList from "../pages/castMember/PageList";
import GenresList from "../pages/genres/PageList";

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
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.edit',
        label: 'Editar categoria',
        path: '/categories/:id/edit',
        component: CategoryList,
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
        component: CastMemberList,
        exact: true
    },
    {
        name: 'cast-members.edit',
        label: 'Editar membro',
        path: '/cast-members/:id/edit',
        component: CastMemberList,
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
        component: GenresList,
        exact: true
    },
    {
        name: 'genres.edit',
        label: 'Editar gênero',
        path: '/genres/:id/edit',
        component: GenresList,
        exact: true
    },
];

export default routes;
