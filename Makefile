run:
		yarn serve

clean:
		rm -Rf ./dist

dist: clean
		yarn build

install:
		yarn

release:
		sed -i 's/"version": .*/"version": "'"${NEW_VERSION}"'",/' package.json
		git commit -am "[release] ${NEW_VERSION}"
		git tag ${NEW_VERSION}
		echo "If everything is OK, you can push with tags i.e. git push origin master --tags"

unit:
		yarn test:unit

doc:
		yarn doc
