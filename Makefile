run:
		yarn serve

clean:
		rm -Rf ./dist

dist: clean
		yarn build

install:
		yarn

unit:
		yarn test:unit
