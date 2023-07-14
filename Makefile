run-local:
	npx ttab -t 'controller' -d ./apps/controller-app 'nvm install 16.20.0; yarn start'
	npx ttab -t 'cast' -d ./apps/cast-app 'nvm install 16.20.0; yarn start'