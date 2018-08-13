run:
		yarn serve

clean:
		rm -Rf ./dist

dist:
		yarn build

install:
		yarn

unit:
		yarn test:unit
