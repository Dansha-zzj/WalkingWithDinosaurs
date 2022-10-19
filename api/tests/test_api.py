import pytest

from api import main

# Fixtures

@pytest.fixture
def client():
    main.app.config['TESTING'] = True

    with main.app.test_client() as client:
        yield client

# Tests

def test_welcome(client):
    rv = client.get('/')
    assert b'Welcome' in rv.data

def test_read_keys(client):
    rv = client.get('/keys')
    assert b'keys' in rv.data

def test_read_dimensions(client):
    rv = client.get('/dimensions')
    assert b'dimensions' in rv.data