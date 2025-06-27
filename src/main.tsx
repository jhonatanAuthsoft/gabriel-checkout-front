import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/login';
import MeusProdutos from './pages/produtos/meusProdutos';
import NovoProduto from './pages/produtos/novoProduto';
import './main.css';
import VendasPainel from './pages/vendas/painel';
import Relatorios from './pages/vendas/relatorios';
import Clientes from './pages/configuracoes/clientes';
import Usuarios from './pages/configuracoes/usuarios';
import Pedidos from './pages/checkout/pedidos';
import Checkout from './pages/checkout';

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
    path: '/pedidos',
    element: <Pedidos />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
); 