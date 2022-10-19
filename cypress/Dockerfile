FROM cypress/included:10.10.0

# Ensure output is saved as an appropriate user
# ref: https://raw.githubusercontent.com/cypress-io/cypress-docker-images/master/examples/included-as-non-root-mapped/Dockerfile

# there is a built-in user "node" that comes from the very base Docker Node image
# we are going to recreate this user and give it _same id_ as external user
# that is going to run this container.
ARG USER_ID=501
ARG GROUP_ID=999

# if you want to see all existing groups uncomment the next command
# RUN cat /etc/group
RUN groupadd -f -g ${GROUP_ID} appuser
# do not log creating new user, otherwise there could be a lot of messages
RUN useradd -r --no-log-init -u ${USER_ID} -g appuser appuser
RUN install -d -m 0755 -o appuser -g appuser /home/appuser

# move test runner binary folder to the non-root's user home directory
RUN mv /root/.cache /home/appuser/.cache
# make sure cypress looks in the right place
ENV CYPRESS_CACHE_FOLDER=/home/appuser/.cache/Cypress

USER appuser
# show user effective id and group - it should be non-zero
# meaning the current user is not root
RUN id

WORKDIR /e2e/

ENTRYPOINT [ "" ]

ENV INCLUDE_FUNCTIONAL_TESTS=True
ENV INCLUDE_SCREENSHOT_TESTS=True

CMD ["bash", "run-tests.sh"]
