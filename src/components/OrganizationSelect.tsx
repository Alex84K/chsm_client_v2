import * as React from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import BusinessIcon from "@mui/icons-material/Business";
import { useUserOrganizations } from "../hooks/useUserOrganizations";
import type { UserOrganizationItem } from "../types/users.types";
import { setCurrentOrgDetails } from "../utils/getOrganisationsUtils";

type OrganizationSelectProps = {
  onOrganizationSelect: (organizationId: string, role: string) => void;
};

const OrganizationSelect = ({
  onOrganizationSelect,
}: OrganizationSelectProps) => {
  const navigate = useNavigate();
  const {
    data: organizations = [],
    error,
    isError,
    isLoading,
  } = useUserOrganizations();

  const selectOrganization = React.useCallback(
    (organization: UserOrganizationItem) => {
      setCurrentOrgDetails(organization.id, organization.role);
      onOrganizationSelect(organization.id, organization.role);

      if (organization.role === "STUDENT" || organization.role === "USER") {
        navigate("/cabinet", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    },
    [navigate, onOrganizationSelect],
  );

  React.useEffect(() => {
    if (organizations.length === 1) {
      selectOrganization(organizations[0]);
    }
  }, [organizations, selectOrganization]);

  return (
    <Box className="login-screen">
      <Container maxWidth="md" className="login-container">
        <Paper elevation={0} className="organization-card">
          <Box className="login-icon" aria-hidden="true">
            <BusinessIcon />
          </Box>

          <Box className="login-heading">
            <Typography component="h1" variant="h5">
              Выберите организацию
            </Typography>
            <Typography color="text.secondary">
              Выберите отделение или организацию для входа в панель.
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : null}

          {isError ? <Alert severity="error">{error.message}</Alert> : null}

          {!isLoading && !isError && !organizations.length ? (
            <Alert severity="warning">
              Вы не состоите ни в одной организации. Пожалуйста, обратитесь к
              администратору за приглашением или активируйте новую организацию
            </Alert>
          ) : null}

          {!isLoading && !isError && organizations.length > 1 ? (
            <Box className="organization-list">
              {organizations.map((organization) => (
                <Button
                  className="organization-option"
                  key={organization.id}
                  onClick={() => selectOrganization(organization)}
                  variant="outlined"
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography color="text.primary" variant="subtitle1">
                      {organization.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {organization.slug}
                    </Typography>
                  </Box>
                  <Chip label={organization.role} size="small" />
                </Button>
              ))}
            </Box>
          ) : null}
        </Paper>
      </Container>
    </Box>
  );
};

export default OrganizationSelect;
