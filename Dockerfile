# Estágio 1: Builder - Constrói os arquivos estáticos da aplicação Vite
# Usamos uma imagem Node para instalar dependências e rodar o script de build
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e o lock file para aproveitar o cache do Docker
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o resto do código fonte da aplicação
COPY . .

# Roda o comando de build do Vite, que gera os arquivos na pasta 'dist'
RUN npm run build

# ---

# Estágio 2: Runner - Serve os arquivos estáticos com NGINX
# Usamos uma imagem NGINX oficial, que é leve e otimizada para servir conteúdo estático
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no estágio 'builder' (da pasta /app/dist)
# para a pasta padrão que o NGINX usa para servir conteúdo web.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do NGINX
EXPOSE 80

# O NGINX já tem um comando padrão para iniciar o servidor,
# então não precisamos de um CMD aqui.
