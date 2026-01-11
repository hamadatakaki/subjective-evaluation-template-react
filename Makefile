build:
	npm run build
	cp server/*.php dist/

prd:
	$(MAKE) build
	php -S localhost:6006 -t dist

reset:
	rm -r server/output server/*.json

back-dev:
	ENVIRONMENT=LOCAL php -S localhost:6006

front-dev:
	npm run dev

archive:
	zip -r website.zip dist/*
