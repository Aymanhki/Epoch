from epoch_backend.persistence.interfaces.session_persistence import session_persistence
from epoch_backend.objects.session import session
from epoch_backend.business.services import services

class access_session_persistence(session_persistence):
    def __init__(self):
        self.session_persistence = services.get_session_persistence()

    def get_session(self, session_id: str):
        return self.session_persistence.get_session(session_id)

    def add_session(self, new_session: session):
        self.session_persistence.add_session(new_session)

    def remove_session(self, session_id: str):
        self.session_persistence.remove_session(session_id)

    def update_session(self, session_to_update: session):
        self.session_persistence.update_session(session_to_update)

    def get_all_sessions(self):
        return self.session_persistence.get_all_sessions()
