
install: snap
	cd snapcraft && snap install clic* && cd ..

snap: FORCE
	cd snapcraft && snapcraft clean && snapcraft snap && cd ..

FORCE:
k