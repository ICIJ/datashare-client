run:
		npm run dev

clean:
		rm -Rf ./dist

dist:
		npm run build

install:
		yarn || npm install

test:
		npm run test
