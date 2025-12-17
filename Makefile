build:
	npm run build
	cp server/*.php dist/

prd:
	$(MAKE) build
	php -S localhost:6006 -t dist

back-dev:
	php -S localhost:6006

front-dev:
	npm run dev
