import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/login';
import MeusProdutos from './pages/produtos/meusProdutos';
import NovoProduto from './pages/produtos/novoProduto';
import EditarProduto from './pages/produtos/editarProduto';
import './main.css';
import VendasPainel from './pages/vendas/painel';
import Relatorios from './pages/vendas/relatorios';
import Clientes from './pages/configuracoes/clientes';
import Usuarios from './pages/configuracoes/usuarios';
import Assinaturas from './pages/checkout/assinaturas';
import Checkout from './pages/checkout';
import ConfiguracoesGerais from './pages/configuracoes/geral';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/produtos',
    element: <MeusProdutos />,
  },
  {
    path: '/produtos/novo',
    element: <NovoProduto />,
  },
  {
    path: '/produtos/editar/:produtoId',
    element: <EditarProduto />,
  },
  {
    path: '/vendas',
    element: <VendasPainel />,
  },
  {
    path: '/relatorios',
    element: <Relatorios />,
  },
  {
    path: '/clientes',
    element: <Clientes />,
  },
  {
    path: '/usuarios',
    element: <Usuarios />,
  },
  {
    path: '/configuracoes',
    element: <ConfiguracoesGerais />,
  },
  {
    path: '/assinaturas',
    element: <Assinaturas />,
  },
  {
    path: '/checkout/:idProduto/:idPlano',
    element: <Checkout />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
); 