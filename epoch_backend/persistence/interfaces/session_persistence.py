from abc import ABC, abstractmethod
from objects.session import session

class session_persistence(ABC):
    @abstractmethod
    def add_session(self, new_session: session):
        pass

    @abstractmethod
    def remove_session(self, session_id: str):
        pass

    @abstractmethod
    def get_session(self, session_id: str):
        pass

    @abstractmethod
    def get_all_sessions(self):
        pass