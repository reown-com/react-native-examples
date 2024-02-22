EXISTS_FASTLANE = $(shell command -v fastlane 2> /dev/null)

install_env:
ifeq "${EXISTS_FASTLANE}" ""
	@echo Installing fastlane
	sudo gem install fastlane --no-document
endif		
	@echo "All dependencies was installed"

build:

	set -o pipefail && env NSUnbufferedIO=YES \
		xcodebuild \
		-project '$(PROJECT_PATH)' \
		-scheme "Release" \
		-destination "platform=iOS Simulator,name=iPhone 14" \
		-derivedDataPath DerivedDataCache \
		-clonedSourcePackagesDirPath ../SourcePackagesCache \
		build-for-testing \
		| xcbeautify

release-web3modal-ios:
	bundle exec fastlane release_testflight username:$(APPLE_ID) token:$(TOKEN) project:$(PROJECT_PATH) --env $(APP)