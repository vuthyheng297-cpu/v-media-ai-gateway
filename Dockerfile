FROM calciumion/new-api:latest

# Put our V-Media custom UI directly into the web build path that new-api serves!
# In new-api, static files are served from /web/build or /app/web/build
COPY dist/ /web/build/
COPY dist/ /app/web/build/

EXPOSE 3000
ENV PORT=3000