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

# Estágio 2: Nginx
FROM nginx:stable-alpine

# Remove o default.conf padrão (opcional, você pode sobrescrever direto)
RUN rm /etc/nginx/conf.d/default.conf

# Copia seu default.conf customizado
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copia os estáticos do build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
# CMD padrão do nginx já é usado
